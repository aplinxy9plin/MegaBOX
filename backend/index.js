const { VK } = require('vk-io');

const vk = new VK();

vk.setOptions({
	token: '542235260ba03e09b3f606ab13fe5afbb2eb2678583f79c21c6c24af27ac8e8788accf442b6a23a5f682f',
	apiMode: 'parallel_selected',
	webhookPath: '/webhook/secret-path'
});

const { updates } = vk;
var vk_app = updates;

vk_app.use(async (context, next) => {
	if (context.is('message') && context.isOutbox) {
		return;
	}

	try {
		await next();
	} catch (error) {
		console.error('Error:', error);
	}
});

vk_app.on('message',(message) => {
    console.log('Новое сообщение:',message.text);
});

async function run() {
	if (process.env.UPDATES === 'webhook') {
		await vk.updates.startWebhook();

		console.log('Webhook server started');
	} else {
		await vk.updates.startPolling();

		console.log('VK longpoll started');
	}
}

run().catch(console.error);
