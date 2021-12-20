
export enum FeildType {
  All = 0,
  Text = 1,
  MultiLine = 2,
  Number = 3,
  DateTime = 4,
  SingleSelection = 5,
  MultiSelection = 6,
  Attachment = 7,
  Date = 8,
  Rating = 9, //remove this and check dependency
  Email = 10,
  Money = 11,
  Applicant = 12,
  LookupAddon = 13,
  SubApplication = 14,
  Hyperlink = 15,
  PhoneNumber = 16,
  RollUp = 17,
  SameLookupRollup = 100, //for frontend rollup use
  Calculated = 18,
  Mapped = 19,
  Note = 20,
  Aggregator = 21
}
