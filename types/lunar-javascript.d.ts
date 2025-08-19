// types/lunar-javascript.d.ts - lunar-javascript 类型声明文件

declare module "lunar-javascript" {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number
    ): Solar;

    getYear(): number;
    getMonth(): number;
    getDay(): number;
    toString(): string;
    getLunar(): Lunar;
  }

  export class Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    toString(): string;
    getEightChar(): EightChar;
    getYun(gender: number): Yun | null;
  }

  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;

    getYearGan(): string;
    getYearZhi(): string;
    getYearHideGan(): string[];
    getYearShiShenGan(): string;
    getYearShiShenZhi(): string;

    getMonthGan(): string;
    getMonthZhi(): string;
    getMonthHideGan(): string[];
    getMonthShiShenGan(): string;
    getMonthShiShenZhi(): string;

    getDayGan(): string;
    getDayZhi(): string;
    getDayHideGan(): string[];
    getDayShiShenGan(): string;
    getDayShiShenZhi(): string;

    getTimeGan(): string;
    getTimeZhi(): string;
    getTimeHideGan(): string[];
    getTimeShiShenGan(): string;
    getTimeShiShenZhi(): string;

    getYun(gender: number): Yun | null;
    toString(): string;
  }

  export class Yun {
    getStartAge(): number;
    getStartYear(): number;
    getDaYun(): DaYun[];
  }

  export class DaYun {
    getStartAge(): number;
    getEndAge(): number;
    getStartYear(): number;
    getEndYear(): number;
    getGanZhi(): string;
    getLiuNian(): LiuNian[];
  }

  export class LiuNian {
    getYear(): number;
    getGanZhi(): string;
  }
}
