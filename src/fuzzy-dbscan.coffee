class FuzzyDBSCAN
	_epsMin: undefined
	_epsMax: undefined
	_mPtsMin: undefined
	_mPtsMax: undefined
	_distance: undefined

	epsMin: (value) =>
		@_epsMin = value
		return @

	epsMax: (value) =>
		@_epsMax = value
		return @

	mPtsMin: (value) =>
		@_mPtsMin = value
		return @

	mPtsMax: (value) =>
		@_mPtsMax = value
		return @

	distance: (fn) =>
		@_distance = fn
		return @

	cluster: (points) =>
		noiseCluster = []
		clusters = []
		visited = new Array(points.lenght).fill(false)
		for pointIndex in [0...points.length] by 1 when not visited[pointIndex]
			visited[pointIndex] = true
			neighborIndices = @_regionQuery(points, pointIndex)
			pointLabel = @_muMinP(@_density(pointIndex, neighborIndices, points))
			if pointLabel is 0
				noiseCluster.push {index: pointIndex, cause: 'NOISE', label: 1.0}
			else
				clusters.push @_expandClusterFuzzy(pointLabel, pointIndex, neighborIndices, points, visited)
		if noiseCluster.length > 0
			clusters.push noiseCluster
		return clusters

	_expandClusterFuzzy: (pointLabel, pointIndex, neighborIndices, points, visited) =>
		cluster = []
		cluster.push {index: pointIndex, cause: 'CORE', label: pointLabel}
		borderPoints = []
		for neighborIndex from neighborIndices
			neighbor = points[neighborIndex]
			visited[neighborIndex] = true
			neighborNeighborIndices = @_regionQuery(points, neighborIndex)
			neighborLabel = @_muMinP(@_density(neighborIndex, neighborNeighborIndices, points))
			if neighborLabel > 0
				for neighborNeighborIndex from neighborNeighborIndices
					neighborIndices.add neighborNeighborIndex
				cluster.push {index: neighborIndex, cause: 'CORE', label: neighborLabel}
			else
				borderPoints.push {index: neighborIndex, cause: 'BORDER', label: Number.MAX_VALUE}
		for borderPoint from borderPoints
			for clusterPoint from cluster
				d = @_muDistance(points[borderPoint.index], points[clusterPoint.index])
				if d > 0
					borderPoint.label = Math.min(clusterPoint.label, d, borderPoint.label)
		cluster.push ...borderPoints
		return cluster

	_regionQuery: (points, pointIndex) ->
		point = points[pointIndex]
		neighborIndices = new Set()
		for neighbourIndex in [0...points.length] by 1 when neighbourIndex isnt pointIndex
			if @_distance(points[neighbourIndex], point) <= @_epsMax
				neighborIndices.add neighbourIndex
		return neighborIndices

	_density: (pointIndex, neighborIndices, points) ->
		point = points[pointIndex]
		sum = 0
		for neighborIndex from neighborIndices
			sum += @_muDistance(point, points[neighborIndex])
		return sum

	_muMinP: (n) ->
		if n >= @_mPtsMax
			return 1
		else if n <= @_mPtsMin
			return 0
		else
			return (n - @_mPtsMin) / (@_mPtsMax - @_mPtsMin)

	_muDistance: (pointA, pointB) ->
		d = @_distance(pointA, pointB)
		if d <= @_epsMin
			return 1
		else if d > @_epsMax
			return 0
		else
			return (@_epsMax - d) / (@_epsMax - @_epsMin)

module.exports = ->	new FuzzyDBSCAN()
