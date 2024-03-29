

class BlockToDB {

	constructor(BlockChainData , CassandraDBUtils) {
		this.blockChainData = BlockChainData;
		this.cassandraDBUtils = CassandraDBUtils;
	}

	// WITNESSES
	putAllWitnessesIntoDB(){
		let that = this;

	    var allWitnessPromise = this.blockChainData.listWitnesses()
	    allWitnessPromise.then(function(dataFromNode){
	        for (var i = 0; i < dataFromNode.witnessesList.length; i++) {
	            let params = that._buildParamsForWitnessInsertStatment(dataFromNode.witnessesList[i]);
	            that.cassandraDBUtils.insertWitness(params)
	        }
	    });
	}

	// NODES
	putAllNodesIntoDB(){
		let that = this;

	    var allNodesPromise = this.blockChainData.listNodes()
	    allNodesPromise.then(function(dataFromNode){
			for (var i = 0; i < dataFromNode.nodesList.length; i++) {
				let params = that._buildParamsForNodeInsertStatment(dataFromNode.nodesList[i].address);
				that.cassandraDBUtils.insertNode(params);
			}
	    });
	}

	// ISSUEDASSETS
	putAllIssuedAssetsIntoDB(){
		var that = this;

		var allIssuedAssetsPromise = this.blockChainData.getAssetIssueList();
		allIssuedAssetsPromise.then(function(dataFromNode){
			for (var i = 0; i < dataFromNode.assetissueList.length; i++) {
				let params = that._buildParamsForIssuedAssetsInsertStatment(dataFromNode.assetissueList[i]);
				that.cassandraDBUtils.insertAssetIssue(params);
			}
	    });
	}

	// ACCOUNTS
	putAllAccountsIntoDB(){
		let that = this;

	    let allAccountsPromise = this.blockChainData.listAccounts()
	    allAccountsPromise.then(function(dataFromNode){
	        for(let i = 0;i<dataFromNode.accountsList.length;i++){
	        	let params = that._buildParamsForAccountInsertStatment(dataFromNode.accountsList[i]);
	        	that.cassandraDBUtils.insertAccount(params);
	        }
	    });
	}

	// BLOCKS
	putBlockIntoDatabaseFromLocalNodeByLatest(){
		var that = this;

	    var dataPromise = this.blockChainData.getLatestBlockFromLocalNode();
	    dataPromise.then(function(dataFromLocalNode){
	        const params = that._buildParamsForBlockInsertStatment(dataFromLocalNode);
	        that.cassandraDBUtils.insertBlock(params);
	    });
	}

	putBlockIntoDatabaseFromLocalNodeByNumber(number){
		var that = this;

	    var dataPromiseByNumber = this.blockChainData.getBlockFromLocalNode(number);
	    dataPromiseByNumber.then(function(dataFromLocalNode){
	        const params = that._buildParamsForBlockInsertStatment(dataFromLocalNode);
	        that.cassandraDBUtils.insertBlock(params);
	    });
	}

	putAllBlockDataIntoDB(){
		var that = this;

	    var dataPromise = this.blockChainData.getLatestBlockFromLocalNode();
	    dataPromise.then(function(dataFromLocalNode){
	    	//dataFromLocalNode.number
	        for(let i = 0; i<10000; i++){
	        	//console.log(i);
	            that.putBlockIntoDatabaseFromLocalNodeByNumber(i);
	        }
	    });
	}

	_buildParamsForBlockInsertStatment(dataFromLocalNode){
	    let transactions = {};
	    let contracttypes = {};

	    for (let i = 0; i < dataFromLocalNode.transactions.length; i++) {
	        let replaceFrom = JSON.stringify(dataFromLocalNode.transactions[i]).replace(/from/, 'fromaddress');
	        let replaceTo = replaceFrom.replace(/to/, 'toaddress');
	        let newArray = JSON.parse(replaceTo);
	        transactions[i] = newArray;
	    }
	    contracttypes["contracttypes"] = dataFromLocalNode.contractType;

	    let contractTypeToLower = JSON.stringify(contracttypes).toLowerCase();
	    let contractTypesParsed = JSON.parse(contractTypeToLower);

	    let params = [dataFromLocalNode.parentHash, dataFromLocalNode.number, dataFromLocalNode.time, contractTypesParsed, dataFromLocalNode.witnessAddress, dataFromLocalNode.transactionsCount, transactions];
	    return params;
	}

	_buildParamsForWitnessInsertStatment(dataFromNode){
	    let params = [dataFromNode.address, dataFromNode.votecount, dataFromNode.pubkey, dataFromNode.url, dataFromNode.totalmissed, dataFromNode.latestblocknum, dataFromNode.latestslotnum, dataFromNode.isjobs];
	    return params;
	}

	_buildParamsForNodeInsertStatment(dataFromNode){
		let decodedHost = new Buffer(dataFromNode.host, 'base64').toString();
	    let params = [decodedHost, dataFromNode.port.toString()];
	    return params;
	}

	_buildParamsForIssuedAssetsInsertStatment(dataFromNode){
		dataFromNode.name = new Buffer(dataFromNode.name, 'base64').toString();
		dataFromNode.description = new Buffer(dataFromNode.description, 'base64').toString();
		dataFromNode.url = new Buffer(dataFromNode.url, 'base64').toString();

		let params = [dataFromNode.ownerAddress, dataFromNode.name, dataFromNode.totalSupply, dataFromNode.trxNum, dataFromNode.num, dataFromNode.startTime, dataFromNode.endTime, dataFromNode.decayRatio, dataFromNode.voteScore, dataFromNode.description, dataFromNode.url]
		return params;
	}

	_buildParamsForAccountInsertStatment(dataFromNode){
		let votesList = {};
		let assetMap = {};

		for (let i = 0; i < dataFromNode.votesList.length; i++) {
	        votesList[i] = dataFromNode.votesList[i];
	    }

	    for (let i = 0; i < dataFromNode.assetMap.length; i++) {
	        assetMap[dataFromNode.assetMap[i][0]] = dataFromNode.assetMap[i][1];
	    }

		let params = [dataFromNode.accountName, dataFromNode.type, dataFromNode.address, dataFromNode.balance, votesList, assetMap, dataFromNode.latestOprationTime];
		return params;
	}
}

module.exports = BlockToDB;
