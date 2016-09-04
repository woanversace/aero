const emptyFunction = function() {}

let handleError = (error, request, response) => {
	console.error(chalk.bold(request.method, request.url))
	response.writeHead(500)

	if(error.stack) {
		console.error(chalk.red(error.stack))
		response.end(error.stack)
	} else {
		console.error(chalk.red(error))
		response.end(error)
	}
}

module.exports = function(route, request, response) {
	console.log(request.url)
	if(request.isSpdy && !request.url.startsWith('/_') && request.url !== '/styles.css') {
		response.push('/styles.css', {
			method: 'GET',
			status: 200,
			request: {
				accept: '*/*'
			},
			response: {
				'content-type': 'text/css',
				'content-encoding': 'gzip',
				'content-length': this.pushCSS.length
			}
		}, (error, stream) => {
			if(error)
				return console.error(error)

			stream.on('error', function(error) {
				console.error(error)
			    stream.end()
			})

			stream.end(this.pushCSS)
        })
	}

	// Execute handler
	if(this.modifiers.length === 0) {
		try {
			route(request, response)
		} catch(error) {
			handleError(error, request, response)
		}
	} else {
		let generateNext = index => {
			if(index === this.modifiers.length)
				return route.bind(undefined, request, response, emptyFunction)

			return this.modifiers[index].bind(undefined, request, response, generateNext(index + 1))
		}

		try {
			generateNext(0)()
		} catch(error) {
			handleError(error, request, response)
		}
	}
}