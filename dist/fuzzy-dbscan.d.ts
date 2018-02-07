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
        epsMin(value?: number): FuzzyDBSCAN | number;
        epsMax(value?: number): FuzzyDBSCAN | number;
        mPtsMin(value?: number): FuzzyDBSCAN | number;
        mPtsMax(value?: number): FuzzyDBSCAN | number;
        distanceFn(fn?: DistanceFunction): FuzzyDBSCAN | DistanceFunction;
        cluster(points: Array<any>): Array<Array<Assignment>>;
    }    
}
