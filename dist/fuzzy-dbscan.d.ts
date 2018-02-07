export declare const enum Category {
    Core = "CORE",
    Border = "BORDER",
    Noise = "NOISE",
}
export interface Assignment {
    index: number;
    category: Category;
    label: number;
}
export declare type DistanceFunction = (a: any, b: any) => number;
export declare class FuzzyDBSCAN {
    epsMin(value?: number): FuzzyDBSCAN | number;
    epsMax(value?: number): FuzzyDBSCAN | number;
    mPtsMin(value?: number): FuzzyDBSCAN | number;
    mPtsMax(value?: number): FuzzyDBSCAN | number;
    distanceFn(fn?: DistanceFunction): FuzzyDBSCAN | DistanceFunction;
    cluster(points: Array<any>): Array<Array<Assignment>>;
}
