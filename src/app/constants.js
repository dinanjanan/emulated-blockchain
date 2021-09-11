export const ConnectionStates = {
	connected: {
		type: 'connected',
		backgroundColor: '#cfefdf',
		color: '#00a854',
	},
	disconnected: {
		type: 'disconnected',
		backgroundColor: '#fcdbd9',
		color: '#f04134',
	},
	currentlyActive: {
		type: 'currentlyActive',
		backgroundColor: '#d2eafb',
		color: '#108ee9',
	},
};

export const OperationStates = {
	pending: 'pending',
	complete: 'complete',
	failed: 'failed',
};
