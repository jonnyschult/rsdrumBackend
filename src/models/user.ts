export class User {
  constructor(
    public email: string,
    public password?: string,
    public DOB?: string,
    public active?: boolean,
    public student?: boolean,
    public admin?: boolean,
    public firstName?: string,
    public lastName?: string,
    public createdAt?: string,
    public updatedAt?: string,
    public id?: string,
    public passwordhash?: string
  ) {}
}
