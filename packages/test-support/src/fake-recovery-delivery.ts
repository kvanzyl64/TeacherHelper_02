export type FakePasswordRecoveryMessage = {
  to: string;
  recoveryUrl: string;
  expiresAt: Date;
};

export class FakePasswordRecoveryDelivery {
  readonly messages: FakePasswordRecoveryMessage[] = [];

  async sendRecoveryMessage(message: FakePasswordRecoveryMessage): Promise<void> {
    this.messages.push({ ...message });
  }
}
