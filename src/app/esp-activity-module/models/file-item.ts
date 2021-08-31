export class FileItem {
    public ContentType!: string;
    public DownloadUrl = '';
    public FileName!: string;
    public FileSize!: number;
    public Id!: string;
    public FileData: any; // used internally not coming from server
    public binaryData!: string; // used internally not coming from server
    constructor(file?: any) {
        if (!file) {
            return;
        }
        this.ContentType = file.ContentType;
        this.DownloadUrl = file.DownloadUrl;
        this.FileName = file.FileName;
        this.FileSize = file.FileSize;
        this.Id = file.Id;
    }
}
