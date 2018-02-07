export = fuzzy_dbscan;

declare function fuzzy_dbscan(): fuzzy_dbscan.FuzzyDBSCAN;

declare namespace fuzzy_dbscan {
    const enum Category {
        Core = "CORE",
        Border = "BORDER",
        Noise = "NOISE",
    }
    interface Assignment {
        index: number;
        category: Category;
        label: number;
    }
    type DistanceFunction = (a: any, b: any) => number;
    class FuzzyDBSCAN {
        epsMin(): number;
        epsMin(value: number): FuzzyDBSCAN;
        epsMax(): number;
        epsMax(value: number): FuzzyDBSCAN;
        mPtsMin(): number;
        mPtsMin(value: number): FuzzyDBSCAN;
        mPtsMax(): number;
        mPtsMax(value: number): FuzzyDBSCAN;
        distanceFn(): DistanceFunction;
        distanceFn(fn: DistanceFunction): FuzzyDBSCAN;
        cluster(points: Array<any>): Array<Array<Assignment>>;
    }    
}
