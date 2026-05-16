import { tournamentConfig } from "../config/tournamentConfig";

export const COURSE_PARS = tournamentConfig.coursePars;

export const OUT_PAR = COURSE_PARS.slice(0, 9).reduce((sum, par) => sum + par, 0);
export const IN_PAR = COURSE_PARS.slice(9).reduce((sum, par) => sum + par, 0);
export const TOTAL_PAR = COURSE_PARS.reduce((sum, par) => sum + par, 0);
