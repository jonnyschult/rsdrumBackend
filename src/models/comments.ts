export class Comment {
  constructor(
    public comment: string,
    public read: boolean,
    public userId: string,
    public firstName: string,
    public response: boolean,
    public createdAt: number,
    public id?: string
  ) {}
}
