import skillData from "../data/skills.yaml";

export interface Skill {
  label: string;
  name: string;
  initial: number | string | undefined;
  occupation?: number;
  interest?: number;
  growth?: number;
  contains?: Array<Skill>;
  tag?: Array<string>;
  deletable?: boolean;
}

export const skillList: Array<Skill> = skillData as Array<Skill>;
