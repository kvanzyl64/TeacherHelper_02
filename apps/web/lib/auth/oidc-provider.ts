import { createPublicKey, verify as verifySignature } from "node:crypto";

export type OidcClaims = {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat?: number;
  nonce?: string;
  email?: string;
  name?: string;
};

export type OidcConfiguration = {
  issuer: string;
  audience: string;
  jwksUri: string;
};

export class OidcVerificationError extends Error {
  constructor(message = "The identity could not be verified") {
    super(message);
    this.name = "OidcVerificationError";
  }
}

function decodeJson(value: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Record<string, unknown>;
  } catch {
    throw new OidcVerificationError();
  }
}

export function getOidcConfiguration(env = process.env): OidcConfiguration {
  const issuer = env.OIDC_ISSUER_URL?.replace(/\/$/, "");
  const audience = env.OIDC_AUDIENCE;
  const jwksUri = env.OIDC_JWKS_URI;
  if (!issuer || !audience || !jwksUri) throw new OidcVerificationError("OIDC configuration is incomplete");
  return { issuer, audience, jwksUri };
}

export function getOidcAuthorizationUrl(state: string, env = process.env): string {
  const endpoint = env.OIDC_AUTHORIZATION_ENDPOINT;
  const clientId = env.OIDC_CLIENT_ID;
  const redirectUri = env.OIDC_REDIRECT_URI;
  if (!endpoint || !clientId || !redirectUri) throw new OidcVerificationError("OIDC login configuration is incomplete");
  const url = new URL(endpoint);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeOidcCode(code: string, env = process.env, fetcher: typeof fetch = fetch): Promise<string> {
  const endpoint = env.OIDC_TOKEN_ENDPOINT;
  const clientId = env.OIDC_CLIENT_ID;
  const clientSecret = env.OIDC_CLIENT_SECRET;
  const redirectUri = env.OIDC_REDIRECT_URI;
  if (!endpoint || !clientId || !clientSecret || !redirectUri) throw new OidcVerificationError("OIDC token configuration is incomplete");
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri }),
  });
  if (!response.ok) throw new OidcVerificationError();
  const payload = (await response.json()) as { id_token?: string };
  if (!payload.id_token) throw new OidcVerificationError();
  return payload.id_token;
}

export function validateOidcClaims(claims: OidcClaims, configuration: OidcConfiguration, now = Date.now()): OidcClaims {
  const audienceMatches = Array.isArray(claims.aud) ? claims.aud.includes(configuration.audience) : claims.aud === configuration.audience;
  if (claims.iss !== configuration.issuer || !audienceMatches || !claims.sub || claims.exp * 1000 <= now) {
    throw new OidcVerificationError();
  }
  return claims;
}

export async function verifyOidcIdToken(
  token: string,
  configuration: OidcConfiguration = getOidcConfiguration(),
  fetcher: typeof fetch = fetch,
): Promise<OidcClaims> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new OidcVerificationError();
  const header = decodeJson(parts[0]);
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new OidcVerificationError();

  const response = await fetcher(configuration.jwksUri);
  if (!response.ok) throw new OidcVerificationError();
  const jwks = (await response.json()) as { keys?: Array<Record<string, unknown>> };
  const jwk = jwks.keys?.find((key) => key.kid === header.kid && key.kty === "RSA");
  if (!jwk) throw new OidcVerificationError();

  const valid = verifySignature(
    "RSA-SHA256",
    Buffer.from(`${parts[0]}.${parts[1]}`),
    createPublicKey({ key: jwk, format: "jwk" }),
    Buffer.from(parts[2], "base64url"),
  );
  if (!valid) throw new OidcVerificationError();
  return validateOidcClaims(decodeJson(parts[1]) as unknown as OidcClaims, configuration);
}