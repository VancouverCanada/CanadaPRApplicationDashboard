export type SourceOption = {
  key: string;
  labelEn: string;
  labelZh: string;
  sheetId: string;
  gid: string;
  link: string;
};

export const SOURCES: SourceOption[] = [
  {
    key: "dec-new",
    labelEn: "Dec (new)",
    labelZh: "12 月表（新）",
    sheetId: "1EPQOzLb40oqopWieywnMRieBarW7nWn9IIOk1l479w0",
    gid: "0",
    link: "https://docs.google.com/spreadsheets/d/1EPQOzLb40oqopWieywnMRieBarW7nWn9IIOk1l479w0/edit?gid=0",
  },
  {
    key: "dec-old",
    labelEn: "Dec (old)",
    labelZh: "12 月表（旧）",
    sheetId: "1ioxtqGnbHi6khSQ4ErvA1SgLgJgmo2LbPxEb01YRRx8",
    gid: "397033753",
    link: "https://docs.google.com/spreadsheets/d/1ioxtqGnbHi6khSQ4ErvA1SgLgJgmo2LbPxEb01YRRx8/edit?gid=397033753",
  },
  {
    key: "nov",
    labelEn: "Nov public",
    labelZh: "11 月公开表",
    sheetId: "1vQ2OOq4aEjZYcAyGWKRBGWj7-6YKeFHP_4dsJTt-Py0",
    gid: "342524790",
    link: "https://docs.google.com/spreadsheets/d/1vQ2OOq4aEjZYcAyGWKRBGWj7-6YKeFHP_4dsJTt-Py0/edit?gid=342524790",
  },
  {
    key: "oct",
    labelEn: "Oct public",
    labelZh: "10 月公开表",
    sheetId: "1V2pSzVcpuWTBT89SaaJaQ0nlLq85vTcfmOh8uhlgeIc",
    gid: "0",
    link: "https://docs.google.com/spreadsheets/d/1V2pSzVcpuWTBT89SaaJaQ0nlLq85vTcfmOh8uhlgeIc/edit?gid=0",
  },
];
