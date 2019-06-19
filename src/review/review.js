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

  review: async () => {
    App.setLoading(true)
    const paperId = $('input[name="paperId"]').val()
    const comment = $('textarea').val()
    const accept = ($('input[value="Reject"]').prop('checked') != true)
    // const reviewerId = await App.journalResearcher.addressId(App.account)
    // const reviewer = await App.journalResearcher.idMember(reviewerId.s)
    const reviewerName = "Someone"

    await App.journal.reviewPaper(paperId,accept, reviewerName, comment)
    await App.PapersCoin.transferFrom(App.factory, App.account, 1)
    App.setLoading(false)
    await App.showPrompt(true)
    await App.cleanForm()
  },
  
  cleanForm: async () => {
    $('input[name="paperId"]').val("")
    $('textarea').val("Enter your comment , Thanks !")
    $('input[value="Accept"]').prop('checked', true)
  },

  showPrompt: async (success) => {
    const reviewerId = await App.journalResearcher.addressId(App.account)
    const reviewer = await App.journalResearcher.idMember(reviewerId.s)
    const name = reviewer[0]
    const org = reviewer[2]

    $('#reviewerPrompt').html(name)
    $('#orgPrompt').html(org)
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