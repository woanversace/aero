let run = Promise.coroutine(function*() {
	this.init()
	this.replayPast()
	this.registerEventListeners()

	yield [
		this.loadConfig(),
		this.loadPackage(),
		this.loadAPIKeys(),
		this.loadCache()
	]

	let fonts = this.loadFonts()

	yield this.loadCertificate()

	yield [
		this.createDirectories(),
		this.loadPlugins(),
		this.loadIcons()
	]

	yield [
		this.loadManifest(),
		this.loadStyles(),
		this.loadScripts()
	]

	this.logFileSize()

	if(!this.production)
		this.startLiveReload()

	yield this.loadLayout()

	// Use cached font definitions if available
	let cachedFonts = this.cache.fonts[this.config.fonts.join(',')]
	if(cachedFonts)
		this.fontsCSS = cachedFonts
	else
		yield fonts

	yield this.loadPages()

	this.loadStatic()
	this.loadRedirects()
	this.registerWebHooks()
	this.loadStartup()

	let css = this.pluginStyles.join(' ') + this.css.map(style => style.code).join(' ')

	if(this.layout.css)
		css += this.layout.css

	if(this.fontsCSS)
		css = this.fontsCSS + css

	let zlib = require('zlib')
	console.log(css)
	zlib.gzip(css, {
		level: zlib.Z_BEST_COMPRESSION
	}, (error, gzippedData) => {
		this.server.pushCSS = gzippedData
	})

	yield this.startServer()

	this.watchFiles()
	this.checkRoutes()
	this.saveCache()

	if(this.production)
		this.cache = null
})

module.exports = function() {
	this.time('All')

	return this.ready = run.bind(this)().then(() => {
		this.timeEnd('All')
		this.onReady()
	})
}