export const enum Cause { Core = "CORE", Border = "BORDER", Noise = "NOISE" }

export interface Assignment {
  index: number;
  cause: Cause;
  label: number;
}

export type DistanceFunction = (a: any, b: any) => number;

export class FuzzyDBSCAN {
  private _epsMin: number = 0;
  private _epsMax: number = 0;
  private _mPtsMin: number = 0;
  private _mPtsMax: number = 0;
  private _distanceFn: DistanceFunction = (a: any, b: any) => Math.abs(b - a);

  epsMin(value?: number): FuzzyDBSCAN | number {
    if (value) {
        this._epsMin = value; 
        return this;
    }
    return this._epsMin;
  }
  
  epsMax(value?: number): FuzzyDBSCAN | number {
    if (value) {
        this._epsMax = value; 
        return this;
    }
    return this._epsMax;
  }

  mPtsMin(value?: number): FuzzyDBSCAN | number {
    if (value) {
        this._mPtsMin = value; 
        return this;
    }
    return this._mPtsMin;
  }

  mPtsMax(value?: number): FuzzyDBSCAN | number {
    if (value) {
        this._mPtsMax = value; 
        return this;
    }
    return this._mPtsMax;
  }

  distanceFn(fn?: DistanceFunction): FuzzyDBSCAN | DistanceFunction {
    if (fn) {
        this._distanceFn = fn; 
        return this;
    }
    return this._distanceFn;
  }

  cluster(points: Array<any>): Array<Array<Assignment>> {
    let noiseCluster = [];
    let clusters = [];
    let visited = new Array(points.length).fill(false);
    for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
      if (visited[pointIndex]) {
        continue;
      }
      visited[pointIndex] = true;
     let neighborIndices = this._regionQuery(points, pointIndex);
      let pointLabel = this._muMinP(this._density(pointIndex, neighborIndices, points));
      if (pointLabel === 0) {
        noiseCluster.push({
          index: pointIndex,
          cause: Cause.Noise,
          label: 1.0
        });
      } else {
        clusters.push(this._expandClusterFuzzy(pointLabel, pointIndex, neighborIndices, points, visited));
      }
    }
    if (noiseCluster.length > 0) {
      clusters.push(noiseCluster);
    }
    return clusters;
  }

  private _expandClusterFuzzy(pointLabel: number, pointIndex: number, neighborIndices: Set<number>, points: Array<any>, visited: Array<boolean>): Array<Assignment> {
    let cluster = [{
      index: pointIndex,
      cause: Cause.Core,
      label: pointLabel
    }];
    let borderPoints = [];
    for (let neighborIndex of neighborIndices) {
      visited[neighborIndex] = true;
      let neighborNeighborIndices = this._regionQuery(points, neighborIndex);
      let neighborLabel = this._muMinP(this._density(neighborIndex, neighborNeighborIndices, points));
      if (neighborLabel > 0) {
        for (let neighborNeighborIndex of neighborNeighborIndices) {
          neighborIndices.add(neighborNeighborIndex);
        }
        cluster.push({
          index: neighborIndex,
          cause: Cause.Core,
          label: neighborLabel
        });
      } else {
        borderPoints.push({
          index: neighborIndex,
          cause: Cause.Border,
          label: Number.MAX_VALUE
        });
      }
    }
    for (let borderPoint of borderPoints) {
      for (let clusterPoint of cluster) {
        let d = this._muDistance(points[borderPoint.index], points[clusterPoint.index]);
        if (d > 0) {
          borderPoint.label = Math.min(clusterPoint.label, d, borderPoint.label);
        }
      }
    }
    cluster.push(...borderPoints);
    return cluster;
  }

  private _regionQuery(points: Array<any>, pointIndex: number): Set<number> {
    let point = points[pointIndex];
    let neighborIndices = new Set();
    for (let neighbourIndex = 0; neighbourIndex < points.length; neighbourIndex++) {
      if (neighbourIndex !== pointIndex) {
        if (this._distanceFn(points[neighbourIndex], point) <= this._epsMax) {
          neighborIndices.add(neighbourIndex);
        }
      }
    }
    return neighborIndices;
  }

  private _density(pointIndex: number, neighborIndices: Set<number>, points: Array<any>): number {
    let point = points[pointIndex];
    let sum = 0;
    for (let neighborIndex of neighborIndices) {
      sum += this._muDistance(point, points[neighborIndex]);
    }
    return sum;
  }

  private _muMinP(n: number): number {
    if (n >= this._mPtsMax) {
      return 1;
    } else if (n <= this._mPtsMin) {
      return 0;
    } else {
      return (n - this._mPtsMin) / (this._mPtsMax - this._mPtsMin);
    }
  }

  private _muDistance(pointA: any, pointB: any): number {
    let d = this._distanceFn(pointA, pointB);
    if (d <= this._epsMin) {
      return 1;
    } else if (d > this._epsMax) {
      return 0;
    } else {
      return (this._epsMax - d) / (this._epsMax - this._epsMin);
    }
  }
}
