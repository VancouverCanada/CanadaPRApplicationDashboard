export type Abbreviation = {
  key: string;
  label: string;
  descriptionEn: string;
  descriptionZh: string;
};

export type AbbreviationGroup = {
  titleEn: string;
  titleZh: string;
  items: Abbreviation[];
};

export const ABBREVIATION_GROUPS: AbbreviationGroup[] = [
  {
    titleEn: "Submission / Receipt",
    titleZh: "提交/收件",
    items: [
      {
        key: "AR",
        label: "AR",
        descriptionEn: "Application Received, recorded by system (pre-AOR)",
        descriptionZh: "Application Received，系统登记为已收到（早于 AOR）",
      },
      {
        key: "AOR",
        label: "AOR",
        descriptionEn: "Acknowledgement of Receipt, IRCC confirms receipt",
        descriptionZh: "Acknowledgement of Receipt，移民局正式确认收到申请",
      },
      {
        key: "ADR",
        label: "ADR",
        descriptionEn: "Additional Document Request, request for extra docs",
        descriptionZh: "Additional Document Request，补料/补件要求",
      },
    ],
  },
  {
    titleEn: "Biometrics / Medical",
    titleZh: "生物/体检",
    items: [
      {
        key: "BIL",
        label: "BIL",
        descriptionEn: "Biometrics Instruction Letter",
        descriptionZh: "Biometrics Instruction Letter，指纹采集通知",
      },
      {
        key: "MR",
        label: "MR",
        descriptionEn: "Medical Request",
        descriptionZh: "Medical Request，体检通知",
      },
      {
        key: "MP",
        label: "MP",
        descriptionEn: "Medical Passed",
        descriptionZh: "Medical Passed，体检通过",
      },
      {
        key: "PCC",
        label: "PCC",
        descriptionEn: "Police Clearance Certificate, background clearance",
        descriptionZh: "Police Clearance Certificate，无犯罪证明",
      },
    ],
  },
  {
    titleEn: "Processing Status",
    titleZh: "审理状态",
    items: [
      {
        key: "BGC",
        label: "BGC",
        descriptionEn: "Background Check (criminality/security)",
        descriptionZh: "Background Check，背景调查（含刑调/安调）",
      },
      {
        key: "RR",
        label: "RR",
        descriptionEn: "Review Required, needs manual review",
        descriptionZh: "Review Required，需人工复核",
      },
      {
        key: "GU",
        label: "GU",
        descriptionEn: "Ghost Update, silent status update",
        descriptionZh: "Ghost Update，系统无邮件的静默状态更新",
      },
      {
        key: "GCMS",
        label: "GCMS",
        descriptionEn: "Global Case Management System notes",
        descriptionZh: "Global Case Management System，移民系统笔记",
      },
    ],
  },
  {
    titleEn: "Visa Offices",
    titleZh: "签证办公室",
    items: [
      {
        key: "VO",
        label: "VO",
        descriptionEn: "Visa Office (general term)",
        descriptionZh: "Visa Office，签证处理办公室的统称",
      },
      {
        key: "PVO",
        label: "PVO",
        descriptionEn: "Primary Visa Office",
        descriptionZh: "Primary Visa Office，主签证处理办公室",
      },
      {
        key: "SVO",
        label: "SVO",
        descriptionEn: "Secondary Visa Office",
        descriptionZh: "Secondary Visa Office，次要/协助处理的签证办公室",
      },
    ],
  },
  {
    titleEn: "Outcome / Landing",
    titleZh: "结果/落地",
    items: [
      {
        key: "PAL",
        label: "PAL",
        descriptionEn: "Pre-Arrival Letter",
        descriptionZh: "Pre-Arrival Letter，预到达信",
      },
      {
        key: "PPR",
        label: "PPR",
        descriptionEn: "Passport Request (visa stamping / eCOPR prep)",
        descriptionZh: "Passport Request，护照请求信（签证贴签或电子登机信前一步）",
      },
      {
        key: "RFV",
        label: "RFV",
        descriptionEn: "Ready For Visa, final notice before stamping/e-boarding",
        descriptionZh: "Ready For Visa，签证贴签/电子登机前的最后通知",
      },
      {
        key: "P1",
        label: "P1",
        descriptionEn: "Portal 1 email/invite for PR Portal",
        descriptionZh: "Portal 1 邮件，收到确认登录 PR Portal 的邀请/链接",
      },
      {
        key: "P2",
        label: "P2",
        descriptionEn: "Portal 2 step, submit photo/address in PR Portal",
        descriptionZh: "Portal 2 步骤，在 PR Portal 提交照片和地址信息",
      },
      {
        key: "eCOPR",
        label: "eCOPR / ECOPR",
        descriptionEn: "Electronic Confirmation of Permanent Residence",
        descriptionZh: "Electronic Confirmation of Permanent Residence，电子版永居确认信",
      },
      {
        key: "COPR",
        label: "COPR",
        descriptionEn: "Confirmation of Permanent Residence",
        descriptionZh: "Confirmation of Permanent Residence，永居确认信",
      },
      {
        key: "RPRF",
        label: "RPRF",
        descriptionEn: "Right of Permanent Residence Fee",
        descriptionZh: "Right of Permanent Residence Fee，永居登陆费",
      },
    ],
  },
  {
    titleEn: "Programs / Streams",
    titleZh: "项目与类别",
    items: [
      {
        key: "EE",
        label: "EE",
        descriptionEn: "Express Entry, immigration system",
        descriptionZh: "Express Entry，快速通道移民系统",
      },
      {
        key: "PNP",
        label: "PNP",
        descriptionEn: "Provincial Nominee Program",
        descriptionZh: "Provincial Nominee Program，省提名项目",
      },
      {
        key: "FSW",
        label: "FSW",
        descriptionEn: "Federal Skilled Worker",
        descriptionZh: "Federal Skilled Worker，联邦技术类",
      },
      {
        key: "CEC",
        label: "CEC",
        descriptionEn: "Canadian Experience Class",
        descriptionZh: "Canadian Experience Class，加拿大学习/工作经验类",
      },
      {
        key: "OINP",
        label: "OINP",
        descriptionEn: "Ontario Immigrant Nominee Program",
        descriptionZh: "Ontario Immigrant Nominee Program，安省省提名",
      },
      {
        key: "SINP",
        label: "SINP",
        descriptionEn: "Saskatchewan Immigrant Nominee Program",
        descriptionZh: "Saskatchewan Immigrant Nominee Program，萨省省提名",
      },
      {
        key: "MPNP",
        label: "MPNP",
        descriptionEn: "Manitoba Provincial Nominee Program",
        descriptionZh: "Manitoba Provincial Nominee Program，曼省省提名",
      },
      {
        key: "AAIP",
        label: "AAIP",
        descriptionEn: "Alberta Advantage Immigration Program",
        descriptionZh: "Alberta Advantage Immigration Program，阿省省提名",
      },
      {
        key: "NBPNP",
        label: "NBPNP",
        descriptionEn: "New Brunswick Provincial Nominee Program",
        descriptionZh: "New Brunswick Provincial Nominee Program，新不伦瑞克省提名",
      },
      {
        key: "BCPNP",
        label: "BCPNP",
        descriptionEn: "British Columbia Provincial Nominee Program",
        descriptionZh: "British Columbia Provincial Nominee Program，不列颠哥伦比亚省提名",
      },
    ],
  },
];
