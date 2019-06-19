App = {
  loading:false,
  ipfsHash: '',
  contracts:{},
  factory:'0x41Fe17F09806787Ec5E6FCA3E38A923eF9Da1941',
  load: async() => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    App.account = web3.eth.accounts[0]
  },

  loadContract: async () => {      
    const journalResearcher = await $.getJSON('../JournalResearcher.json')
    App.contracts.JournalResearcher = TruffleContract(journalResearcher)
    App.contracts.JournalResearcher.setProvider(App.web3Provider)
    App.journalResearcher = await App.contracts.JournalResearcher.deployed()

    const journal = await $.getJSON('../Journal.json')
    App.contracts.Journal = TruffleContract(journal)
    App.contracts.Journal.setProvider(App.web3Provider)
    App.journal = await App.contracts.Journal.deployed()

    const PapersCoin = await $.getJSON('../PapersCoin.json')
    App.contracts.PapersCoin = TruffleContract(PapersCoin)
    App.contracts.PapersCoin.setProvider(App.web3Provider)
    App.PapersCoin = await App.contracts.PapersCoin.deployed()
  },

  render: async () => {
    if(App.loading){
      return
    }
    App.setLoading(true)
    $('#account').html(App.account)
    numConf  = await App.journalResearcher.totalConfNum()
    for(var i=1; i<=numConf; i++){
      var conf = await App.journalResearcher.idConf(i)
      var confName = conf[0]
      // if (i==0) {
      //   $new_conf = $('option[value="paperschain"]')
      // } else {
      //   $new_conf = $('option[value="paperschain"]').prop('value', confName).text(confName)
      // }
      //$('select').appendChild($new_conf)
      var sel = document.getElementById('conf');
      var opt = document.createElement('option');
      opt.appendChild( document.createTextNode(confName) );
      opt.value = confName; 
      sel.appendChild(opt);
    }
    App.setLoading(false)
  },

  setLoading:(boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    const prompt = $('#prompt')

    if (boolean) {
      loader.show()
      content.hide()
      prompt.hide()
    } else {
      loader.hide()
      content.show()
    }
  },

  upload: async () => {
    App.setLoading(true)
    const title = $('input[name="Title"]').val()
    const year = $('input[name="Year"]').val()
    const abstract = $('textarea[name="Abstract"]').val()
    const selectedFile = $('#input')[0].files[0]
    var reader = new FileReader()
    reader.readAsText(selectedFile)

    ipfs = new window.Ipfs()
    await ipfs.on('ready', async () => {
      const version = await ipfs.version()
      console.log('Version:', version.version)

      const filesAdded = await ipfs.add({
        path: title ,
        content: buffer.Buffer.from(reader.result)
      })
      console.log('Added file:', filesAdded[0].path, filesAdded[0].hash)
      App.ipfsHash = filesAdded[0].hash

      const fileBuffer = await ipfs.cat(filesAdded[0].hash)
      console.log('Added file contents:', fileBuffer.toString())
      
     
    })
    await App.journal.uploadPaper(title, year, abstract, App.ipfsHash)
    await App.PapersCoin.transfer(App.factory, 1)
    App.setLoading(false)
    await App.showPrompt(true)
    await App.cleanForm()
  },
  
  cleanForm: async () => {
    $('input[name="Title"]').val("")
    $('input[name="Year"]').val("")
    $('textarea[name="Abstract"]').val("")
  },

  showPrompt: async (success) => {
    const title = $('input[name="Title"]').val()
    const year = $('input[name="Year"]').val()

    $('#titlePrompt').html(title)
    $('#yearPrompt').html(year)
    $('#addressPrompt').html(App.account)
    $('#ipfsPrompt').html(App.ipfsHash)

    if (success) {
      $('#prompt').show()
    }
  }


}

$(()=> {
  $(window).load(() => {
    App.load()
  })  
})