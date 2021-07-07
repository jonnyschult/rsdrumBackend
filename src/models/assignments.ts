export class Assignment {
  constructor(
    public assignmentNumber: number,
    public title: string,
    public description: string,
    public primaryImg: string,
    public auxImg: string | null,
    public url?: string | null,
    public linkName?: string | null,
    public id?: string
  ) {}
}
