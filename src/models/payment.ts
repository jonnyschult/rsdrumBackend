export class Payment {
  constructor(
    public userId: string,
    public cardHoldersName: string,
    public email: string,
    public chargeAmount: number,
    public itemTitle: string,
    public purchaseQuantity: number,
    public chargeDate: string,
    public numberOfLessons?: number,
    public id?: string
  ) {}
}
