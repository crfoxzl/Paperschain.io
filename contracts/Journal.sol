pragma solidity ^0.5.0;

import "./JournalResearcher.sol" as researcher;

contract Journal {
    uint public totalPaperNum;
    uint public totalReviewNum;

    struct Review {
        bool accept;
        string reviewer;
        string comment;
    }

    struct Paper {
        string title;
        uint year;
        string paperAbstract;
        string ipfsHash;
        bool passReviewed;
        uint reviewedTimes;
        uint[10] reviewLog;
    }

    mapping(uint => Review) public reviewDict;
    mapping(uint => Paper) public paperDict;
    mapping(address => uint) public addressTotalUploaded;
    mapping(address => mapping(uint => uint)) public addressUploaded;
    mapping(uint => uint) public check;

    constructor() public {
        totalPaperNum = 0;
        totalReviewNum = 0;
    }


    function uploadPaper(string memory _title, uint _year, string memory _paperAbstract, string memory _ipfsHash) public returns(uint){
        totalPaperNum++;
        uint[10] memory _reviewLog;
        Paper memory newPaper = Paper({
            title: _title,
            year: _year,
            paperAbstract: _paperAbstract,
            ipfsHash: _ipfsHash,
            passReviewed: false,
            reviewedTimes: 0,
            reviewLog: _reviewLog
        });
        paperDict[totalPaperNum] = newPaper;
        addressTotalUploaded[msg.sender]++;
        addressUploaded[msg.sender][addressTotalUploaded[msg.sender]] = totalPaperNum;
    }

    function reviewPaper(uint _paperId, bool _accept, string memory _reviewer, string memory _comment) public {
        require(paperDict[_paperId].passReviewed == false, "The paper has passed review.");
        require(paperDict[_paperId].reviewedTimes <= 10, "Too many reviews.");

        totalReviewNum++;
        Review memory newReview = Review(_accept, _reviewer, _comment);
        reviewDict[totalReviewNum] = newReview;

        paperDict[_paperId].reviewedTimes++;
        paperDict[_paperId].passReviewed = _accept;
        paperDict[_paperId].reviewLog[paperDict[_paperId].reviewedTimes] = totalReviewNum;
    }

    function setCheck(uint _paperId) public {
        uint[10] memory log = paperDict[_paperId].reviewLog;
        uint n = paperDict[_paperId].reviewedTimes;
        for(uint i = 1; i <= n; i++){
            check[i] = log[i];
        }
    }
}
