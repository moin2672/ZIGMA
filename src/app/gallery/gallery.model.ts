export interface Gallery {
  _id: string;
  modelNo: string;
  modelName: string;
  modelDescription: string;
  isAvailable:boolean;
  links: string[];
  creator:string;
  lastUpdatedDate: string;
}