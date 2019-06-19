App = {
  loading:false,
  ipfsHash: '',
  contracts:{},
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
  },

  render: async () => {
    if(App.loading){
      return
    }
    App.setLoading(true)
    $('#account').html(App.account)
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

  createConf: async () => {
    App.setLoading(true)
    const conf = $('input[name="Conf"]').val()
    const start = $('input[name="Start"]').val()
    const end = $('input[name="End"]').val()
    const intro = $('input[name="Intro"]').val()
    const reviewer = $('input[name="Reviewer"]').val()
    const time = String(start) +　"-" + String(end)

    await App.journalResearcher.createConf(conf, time, intro, reviewer)
    App.setLoading(false)
    await App.showPrompt(true)
    await App.cleanForm()
  },
  
  cleanForm: async () => {
    $('input[name="Conf"]').val("")
    $('input[name="Intro"]').val("")
    $('input[name="Reviewer"]').val("")
  },

  showPrompt: async (success) => {
    const conf = $('input[name="Conf"]').val()
    const start = $('input[name="Start"]').val()
    const end = $('input[name="End"]').val()
    const intro = $('input[name="Intro"]').val()
    const reviewer = $('input[name="Reviewer"]').val()
    const reviewerId = await App.journalResearcher.addressId(App.account)
    const name = (await App.journalResearcher.idMember(reviewerId.s))[0]

    $('#confPrompt').html(conf)
    $('#startPrompt').html(start)
    $('#endPrompt').html(end)
    $('#introPrompt').html(intro)
    $('#reviewerPrompt').html(reviewer)
    $('#namePrompt').html(name)
    $('#addressPrompt').html(App.account)

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