export class Video {
  constructor(
    public videoUrl: string,
    public title: string,
    public description: string,
    public instructional: boolean,
    public tags: string[],
    public id?: string
  ) {}
}
