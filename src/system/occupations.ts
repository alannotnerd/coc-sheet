import { Attributes } from "./stats";
import { computeSkillPoint } from "./interpreter";
import occupationsData from "../data/occupations.yaml";

export interface Occupation {
  name: string;
  credit: [number, number];
  skills: string;
  skillPoint: string;
  description?: string;
}

export const occupations = occupationsData;

export const occupationsSkillPoints = (attributes: Partial<Attributes>) => {
  return occupations.map((x) => computeSkillPoint(attributes, x.skillPoint));
};
