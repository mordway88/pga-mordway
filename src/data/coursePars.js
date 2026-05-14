// Aronimink Golf Club, 2026 PGA Championship setup: par 70, 35 out / 35 in.
export const COURSE_PARS = [4, 4, 4, 4, 3, 4, 4, 3, 5, 4, 4, 4, 4, 3, 4, 5, 3, 4];

export const OUT_PAR = COURSE_PARS.slice(0, 9).reduce((sum, par) => sum + par, 0);
export const IN_PAR = COURSE_PARS.slice(9).reduce((sum, par) => sum + par, 0);
export const TOTAL_PAR = COURSE_PARS.reduce((sum, par) => sum + par, 0);
