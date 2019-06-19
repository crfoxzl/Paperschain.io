App = {
  loading:false,
  registered: false,
  contracts:{},
  factory:'0x41Fe17F09806787Ec5E6FCA3E38A923eF9Da1941',
  load: async() => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.checkRegistration()
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
    const journalResearcher = await $.getJSON('JournalResearcher.json')
    App.contracts.JournalResearcher = TruffleContract(journalResearcher)
    App.contracts.JournalResearcher.setProvider(App.web3Provider)
    App.journalResearcher = await App.contracts.JournalResearcher.deployed()

    const PapersCoin = await $.getJSON('PapersCoin.json')
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
    await App.renderMember()
    App.setLoading(false)
  },

  checkRegistration: async () => {
    const id = await App.journalResearcher.addressId(App.account)
    if (id > 0) {
      App.registered = true
    } else {
      App.registered = false
    }
  },

  setLoading:(boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    const memberInfo = $('#memberInfo') 

    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      if (!App.registered){
        content.show()
        memberInfo.hide()
      } else {
        content.hide()
        memberInfo.show()
      }
    }
  },

  renderMember: async () => {
      const id = await App.journalResearcher.addressId(App.account)
      const info = await App.journalResearcher.idMember(id)
      $('#nameInfo').text(info[0])
      $('#statusInfo').text(info[1])
      $('#organizationInfo').text(info[2])
      $('#emailInfo').text(info[3])
  },
  
  register: async () => {
    App.setLoading(true)
    const name = $('#name').val()
    const status = $('#status').val()
    const organization = $('#organization').val()
    const email = $('#email').val()
    await App.journalResearcher.register(name, status, organization, email)
    await App.PapersCoin.allowance(App.factory, App.account)
    await App.PapersCoin.transferFrom(App.factory, App.account, 10)
    window.location.reload()
  }
}

$(()=> {
  $(window).load(() => {
    App.load()
  })  
})