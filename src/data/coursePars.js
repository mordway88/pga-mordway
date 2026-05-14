export const COURSE_PARS = [4, 4, 4, 4, 3, 4, 4, 5, 4, 4, 4, 3, 4, 5, 4, 3, 4, 4];

export const OUT_PAR = COURSE_PARS.slice(0, 9).reduce((sum, par) => sum + par, 0);
export const IN_PAR = COURSE_PARS.slice(9).reduce((sum, par) => sum + par, 0);
export const TOTAL_PAR = COURSE_PARS.reduce((sum, par) => sum + par, 0);
