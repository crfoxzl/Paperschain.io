pragma solidity ^0.5.0;

contract JournalResearcher{
    uint public totalResearcherNum;
    uint public totalConfNum;

    struct Researcher {
        string name;
        string status;
        string organization;
        string email;
        uint published;
        mapping (uint => uint) papersId;
    }

    struct Conference {
        string confName;
        string time;
        string intro;
        string reviewers;
    }

    mapping (string => uint) emailId;
    mapping (address => uint) public addressId;
    mapping (uint => Researcher) public idMember;
    mapping (uint => Conference) public idConf;

    constructor() public{
        totalResearcherNum = 0;
        totalConfNum = 0;
    }

    function register(string memory _name, string memory _status, string memory _org, string memory _email) public {
        require(addressId[msg.sender] == 0, "Current user has registered");
        require(emailId[_email] == 0, "Current email has registered");
        totalResearcherNum++;
        uint _id = totalResearcherNum;
        addressId[msg.sender] = _id;
        emailId[_email] = _id;
        idMember[_id] = Researcher({
            name: _name,
            status: _status,
            organization: _org,
            email: _email,
            published: 0
        });
    }
    
    function createConf(string memory _conf, string memory _time, string memory _intro, string memory _reviewers) public{
        totalConfNum++;
        idConf[totalConfNum] = Conference(_conf, _time, _intro, _reviewers);
    }
}
