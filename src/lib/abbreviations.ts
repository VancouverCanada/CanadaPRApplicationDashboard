export type Abbreviation = {
  key: string;
  label: string;
  description: string;
};

export type AbbreviationGroup = {
  title: string;
  items: Abbreviation[];
};

export const ABBREVIATION_GROUPS: AbbreviationGroup[] = [
  {
    title: "提交/收件",
    items: [
      {
        key: "AR",
        label: "AR",
        description: "Application Received，系统登记为已收到（早于 AOR）",
      },
      {
        key: "AOR",
        label: "AOR",
        description: "Acknowledgement of Receipt，移民局正式确认收到申请",
      },
      {
        key: "ADR",
        label: "ADR",
        description: "Additional Document Request，补料/补件要求",
      },
    ],
  },
  {
    title: "生物/体检",
    items: [
      {
        key: "BIL",
        label: "BIL",
        description: "Biometrics Instruction Letter，指纹采集通知",
      },
      {
        key: "MR",
        label: "MR",
        description: "Medical Request，体检通知",
      },
      {
        key: "MP",
        label: "MP",
        description: "Medical Passed，体检通过",
      },
      {
        key: "PCC",
        label: "PCC",
        description: "Police Clearance Certificate，无犯罪证明",
      },
    ],
  },
  {
    title: "审理状态",
    items: [
      {
        key: "BGC",
        label: "BGC",
        description: "Background Check，背景调查（含刑调/安调）",
      },
      {
        key: "RR",
        label: "RR",
        description: "Review Required，需人工复核",
      },
      {
        key: "GU",
        label: "GU",
        description: "Ghost Update，系统无邮件的静默状态更新",
      },
      {
        key: "GCMS",
        label: "GCMS",
        description: "Global Case Management System，移民系统笔记",
      },
    ],
  },
  {
    title: "签证办公室",
    items: [
      {
        key: "VO",
        label: "VO",
        description: "Visa Office，签证处理办公室的统称",
      },
      {
        key: "PVO",
        label: "PVO",
        description: "Primary Visa Office，主签证处理办公室",
      },
      {
        key: "SVO",
        label: "SVO",
        description: "Secondary Visa Office，次要/协助处理的签证办公室",
      },
    ],
  },
  {
    title: "结果/落地",
    items: [
      {
        key: "PAL",
        label: "PAL",
        description: "Pre-Arrival Letter，预到达信",
      },
      {
        key: "PPR",
        label: "PPR",
        description: "Passport Request，护照请求信（签证贴签或电子登机信前一步）",
      },
      {
        key: "RFV",
        label: "RFV",
        description: "Ready For Visa，签证贴签/电子登机前的最后通知",
      },
      {
        key: "P1",
        label: "P1",
        description: "Portal 1 邮件，收到确认登录 PR Portal 的邀请/链接",
      },
      {
        key: "P2",
        label: "P2",
        description: "Portal 2 步骤，在 PR Portal 提交照片和地址信息",
      },
      {
        key: "eCOPR",
        label: "eCOPR / ECOPR",
        description: "Electronic Confirmation of Permanent Residence，电子版永居确认信",
      },
      {
        key: "COPR",
        label: "COPR",
        description: "Confirmation of Permanent Residence，永居确认信",
      },
      {
        key: "RPRF",
        label: "RPRF",
        description: "Right of Permanent Residence Fee，永居登陆费",
      },
    ],
  },
  {
    title: "项目与类别",
    items: [
      {
        key: "EE",
        label: "EE",
        description: "Express Entry，快速通道移民系统",
      },
      {
        key: "PNP",
        label: "PNP",
        description: "Provincial Nominee Program，省提名项目",
      },
      {
        key: "FSW",
        label: "FSW",
        description: "Federal Skilled Worker，联邦技术类",
      },
      {
        key: "CEC",
        label: "CEC",
        description: "Canadian Experience Class，加拿大学习/工作经验类",
      },
      {
        key: "OINP",
        label: "OINP",
        description: "Ontario Immigrant Nominee Program，安省省提名",
      },
      {
        key: "SINP",
        label: "SINP",
        description: "Saskatchewan Immigrant Nominee Program，萨省省提名",
      },
      {
        key: "MPNP",
        label: "MPNP",
        description: "Manitoba Provincial Nominee Program，曼省省提名",
      },
      {
        key: "AAIP",
        label: "AAIP",
        description: "Alberta Advantage Immigration Program，阿省省提名",
      },
      {
        key: "NBPNP",
        label: "NBPNP",
        description: "New Brunswick Provincial Nominee Program，新不伦瑞克省提名",
      },
      {
        key: "BCPNP",
        label: "BCPNP",
        description: "British Columbia Provincial Nominee Program，不列颠哥伦比亚省提名",
      },
    ],
  },
];
