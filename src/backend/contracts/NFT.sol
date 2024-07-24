// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721URIStorage, Ownable {
    uint public tokenCount;
    mapping(uint256 => bool) private _locked; // Track locked status of tokens

    // Events for cross-chain communication and ownership transfer
    event TokenLocked(uint256 indexed tokenId, address indexed owner);
    event TokenUnlocked(uint256 indexed tokenId, address indexed owner);
    event TokenBridged(uint256 indexed tokenId, address indexed from, address to);
    event OwnershipTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor() ERC721("MyNFT", "MNT") {}

    function mint(string memory _tokenURI) external returns(uint) {
        tokenCount++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenURI);
        return tokenCount;
    }

    // Lock a token to prevent transfers
    function lockToken(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Token does not exist.");
        _locked[tokenId] = true;
        emit TokenLocked(tokenId, msg.sender);
    }

    // Unlock the token to allow transfers
    function unlockToken(uint256 tokenId) public onlyOwner {
        require(_locked[tokenId], "Token is not locked.");
        _locked[tokenId] = false;
        emit TokenUnlocked(tokenId, msg.sender);
    }

    // Execute a bridge transfer to another address (interoperability function)
    function bridgeTransfer(address _to, uint256 _tokenId) public onlyOwner {
        require(_locked[_tokenId], "Token must be locked before bridging");
        _transfer(owner(), _to, _tokenId);
        emit TokenBridged(_tokenId, owner(), _to);
    }

    // Transfer ownership of a token to another address
    function transferOwnershipOfToken(uint256 tokenId, address to) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can transfer a token");
        require(to != address(0), "Cannot transfer to the zero address");
        _transfer(msg.sender, to, tokenId);
        emit OwnershipTransferred(tokenId, msg.sender, to);
    }
}
