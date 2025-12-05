export type SourceOption = {
  key: string;
  label: string;
  sheetId: string;
  gid: string;
  link: string;
};

export const SOURCES: SourceOption[] = [
  {
    key: "dec-new",
    label: "12 月表（新）",
    sheetId: "1EPQOzLb40oqopWieywnMRieBarW7nWn9IIOk1l479w0",
    gid: "0",
    link: "https://docs.google.com/spreadsheets/d/1EPQOzLb40oqopWieywnMRieBarW7nWn9IIOk1l479w0/edit?gid=0",
  },
  {
    key: "dec-old",
    label: "12 月表（旧）",
    sheetId: "1ioxtqGnbHi6khSQ4ErvA1SgLgJgmo2LbPxEb01YRRx8",
    gid: "397033753",
    link: "https://docs.google.com/spreadsheets/d/1ioxtqGnbHi6khSQ4ErvA1SgLgJgmo2LbPxEb01YRRx8/edit?gid=397033753",
  },
  {
    key: "nov",
    label: "11 月公开表",
    sheetId: "1vQ2OOq4aEjZYcAyGWKRBGWj7-6YKeFHP_4dsJTt-Py0",
    gid: "342524790",
    link: "https://docs.google.com/spreadsheets/d/1vQ2OOq4aEjZYcAyGWKRBGWj7-6YKeFHP_4dsJTt-Py0/edit?gid=342524790",
  },
  {
    key: "oct",
    label: "10 月公开表",
    sheetId: "1V2pSzVcpuWTBT89SaaJaQ0nlLq85vTcfmOh8uhlgeIc",
    gid: "0",
    link: "https://docs.google.com/spreadsheets/d/1V2pSzVcpuWTBT89SaaJaQ0nlLq85vTcfmOh8uhlgeIc/edit?gid=0",
  },
];
