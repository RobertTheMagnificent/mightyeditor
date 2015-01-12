MT(
	MT.plugins.Postman = function(config){
		this.config = config.email;
		
		var mailer = require("nodemailer");
		var transport = require("nodemailer-sendmail-transport");
		this.transport = mailer.createTransport(transport());
		this.templates = require(process.cwd() + "/templates/emails.js");
	},
	{
		send: function(options, template, cb){
			var fs = MT.core.FS;
			var that = this;
			
			var tpl = this.prepareTemplate(this.templates[template], options);
			
			
			//fs.readFile(template, function(err, src){
				that.transport.sendMail({
					from: that.config.from || "info@mightyfingers.com",
					to: options.to,
					subject: options.subject || tpl.subject || "no-subject",
					text: options.text || tpl.text || 'hello world!',
					html: options.html || tpl.html || options.text
				},
				function(error, info){
					if(error){
						console.log("send mail:", error);
						return;
					}
					
					console.log('Message sent: ', info);
				});
			//});
		},
   
		prepareTemplate: function(tpl, options){
			var out = {};
			for(var t in tpl){
				out[t] = tpl[t];
				for(var i in options){
					out[t] = out[t].replace(new RegExp("%"+i+"%", "g"), options[i])
				}
			}
			return out;
		}
	}
);
