export class Tag {
  constructor(
    public tag_name: string,
    public created_at?: string,
    public updated_at?: string,
    public id?: number,
    public video_id?: number
  ) {}
}
