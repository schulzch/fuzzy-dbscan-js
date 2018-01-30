should = require('chai').should()
seed = seed = require 'seed-random'
PImage = require 'pureimage'
fs = require 'fs'
FuzzyDBSCAN = require '../src/fuzzy-dbscan'

euclideanDistance = (pointA, pointB) ->
	Math.sqrt(Math.pow((pointB.x - pointA.x), 2) + Math.pow((pointB.y - pointA.y), 2))

uniformCircle = (n, cx, cy, r) ->
	random = seed('foobar')
	points = []
	for i in [0...n]
		t = 2 * Math.PI * random()
		u = random() + random()
		uu = if u > 1 then 2 - u else u
		points.push
			x: cx + r * uu * Math.cos(t)
			y: cy + r * uu * Math.sin(t)
	return points

dump = (filename, points, clusters) ->
	# Allocate image from bounding box of points.
	minX = Number.MAX_VALUE
	minY = Number.MAX_VALUE
	maxX = Number.MIN_VALUE
	maxY = Number.MIN_VALUE
	for point in points
		minX = Math.min(minX, point.x)
		minY = Math.min(minY, point.y)
		maxX = Math.max(maxX, point.x)
		maxY = Math.max(maxY, point.y)
	margin = 5
	img = PImage.make maxX - minX + margin * 2, maxY - minY + margin * 2
	ctx = img.getContext '2d'
	ctx.fillStyle = '#ffffff'
	# Draw cluster points.
	brewer12Paired = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c',
		'#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00',
		'#cab2d6', '#6a3d9a', '#ffff99', '#b15928']
	for cluster, i in clusters
		for member in cluster
			point = points[member.index]
			if member.cause is 'NOISE'
				ctx.fillStyle = '#ff00ff'
				ctx.globalAlpha = member.label + 0.25
			else
				ctx.fillStyle = brewer12Paired[i % 12]
				ctx.globalAlpha = member.label + 0.5
			ctx.fillRect point.x - minX + margin, point.y - minY + margin, 1, 1
	console.log	'Clusters', clusters, 
		'\nFuzzy-Assigned Indices', [].concat.apply([], clusters)
			.map((member) -> member.index)
			.filter((value, index, array) -> array.indexOf(value) isnt index),
		'\nClusters #', clusters.map((cluster) -> cluster.length),
		'\n# Points', points.length
	# Write image.
	PImage.encodePNGToStream(img, fs.createWriteStream(filename)).then(() ->
		console.log 'wrote ' + filename
	).catch (e) ->
		console.log 'failed writing ' + filename
	return

describe 'FuzzyDBSCAN', ->
	describe 'hard', ->
		points = [...uniformCircle(100, 1, 1, 10), ...uniformCircle(100, 100, 100, 10)]

		it 'should reduce to classic DBSCAN (epsMin = epsMax, mPtsMin = mPtsMax)', ->
			fuzzyDBSCAN = FuzzyDBSCAN()
				.distance(euclideanDistance)
				.epsMin(10.0)
				.epsMax(10.0)
				.mPtsMin(50)
				.mPtsMax(50)
			clusters = fuzzyDBSCAN.cluster(points)
			#dump 'dbscan-hard-classic.png', points, clusters
			clusters.length.should.equal 2

		it 'should reduce to FuzzyBorderDBSCAN (mPtsMin = mPtsMax)', ->
			fuzzyDBSCAN = FuzzyDBSCAN()
				.distance(euclideanDistance)
				.epsMin(10.0)
				.epsMax(20.0)
				.mPtsMin(50)
				.mPtsMax(50)
			clusters = fuzzyDBSCAN.cluster(points)
			#dump 'dbscan-hard-border.png', points, clusters
			clusters.length.should.equal 2

		it 'should reduce to FuzzyCoreDBSCAN (epsMin = epsMax)', ->
			fuzzyDBSCAN = FuzzyDBSCAN()
				.distance(euclideanDistance)
				.epsMin(10.0)
				.epsMax(10.0)
				.mPtsMin(1)
				.mPtsMax(100)
			clusters = fuzzyDBSCAN.cluster(points)
			#dump 'dbscan-hard-core.png', points, clusters
			clusters.length.should.equal 2

	describe 'fuzzy', ->
		it 'should find fuzzy cores', ->
			points = [...uniformCircle(40, 0, 0, 10), ...uniformCircle(80, 100, 0, 10)]
			fuzzyDBSCAN = FuzzyDBSCAN()
				.distance(euclideanDistance)
				.epsMin(10.0)
				.epsMax(10.0)
				.mPtsMin(50)
				.mPtsMax(70)
			clusters = fuzzyDBSCAN.cluster(points)
			#dump 'dbscan-fuzzy-cores.png', points, clusters
			clusters.length.should.equal 2

		it 'should find fuzzy borders', ->
			points = [...uniformCircle(40, 0, 0, 10), ...uniformCircle(80, 100, 0, 10)]
			fuzzyDBSCAN = FuzzyDBSCAN()
				.distance(euclideanDistance)
				.epsMin(50.0)
				.epsMax(90.0)
				.mPtsMin(50)
				.mPtsMax(50)
			clusters = fuzzyDBSCAN.cluster(points)
			#dump 'dbscan-fuzzy-borders.png', points, clusters
			clusters.length.should.equal 2

		it 'should find fuzzy cores and borders', ->
			points = [...uniformCircle(40, 30, 0, 15), ...uniformCircle(10, 50, 0, 10), ...uniformCircle(40, 70, 0, 15)]
			fuzzyDBSCAN = FuzzyDBSCAN()
				.distance(euclideanDistance)
				.epsMin(4.0)
				.epsMax(6.0)
				.mPtsMin(3)
				.mPtsMax(10)
			clusters = fuzzyDBSCAN.cluster(points)
			#dump 'dbscan-fuzzy-overlap.png', points, clusters
			clusters.length.should.equal 8
