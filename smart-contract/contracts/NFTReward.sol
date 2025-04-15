// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./BitGiveRegistry.sol";

/**
 * @title NFTReward
 * @dev NFT reward contract for BitGive donations
 */
contract NFTReward is ERC721URIStorage, AccessControl {
    using Strings for uint256;

    BitGiveRegistry public registry;
    uint256 private tokenIdCounter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct NFTMetadata {
        uint256 tokenId;
        string tier;
        string campaignName;
        uint256 campaignId;
        uint256 mintedAt;
    }

    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => uint256[]) public ownerTokens;
    mapping(string => uint256) public tierCounter;

    // Custom errors
    error InvalidRegistryAddress();
    error CallerNotMinter();
    error TokenDoesNotExist();

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string tier,
        string campaignName,
        uint256 indexed campaignId
    );

    constructor(address _registryAddress) ERC721("BitGive Donor NFT", "BGIVE") {
        if (_registryAddress == address(0)) revert InvalidRegistryAddress();
        registry = BitGiveRegistry(payable(_registryAddress));
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    /**
     * @dev Mints a new NFT reward
     * @param _recipient Recipient address
     * @param _tier NFT tier (Gold, Silver, Bronze)
     * @param _campaignName Name of the campaign
     * @param _campaignId ID of the campaign
     * @return tokenId ID of the minted token
     */
    function mintNFT(
        address _recipient,
        string memory _tier,
        string memory _campaignName,
        uint256 _campaignId,
        string memory _tokenURI
    ) external returns (string memory) {
        _checkMinter();

        uint256 tokenId = tokenIdCounter;
        tokenIdCounter++;

        _safeMint(_recipient, tokenId);

        // Increment tier counter
        tierCounter[_tier]++;

        // Store metadata
        nftMetadata[tokenId] = NFTMetadata({
            tokenId: tokenId,
            tier: _tier,
            campaignName: _campaignName,
            campaignId: _campaignId,
            mintedAt: block.timestamp
        });

        // Update owner tokens
        ownerTokens[_recipient].push(tokenId);

        _setTokenURI(tokenId, _tokenURI);

        emit NFTMinted(tokenId, _recipient, _tier, _campaignName, _campaignId);

        // Return NFT ID in format "Tier #Number"
        return
            string(
                abi.encodePacked(
                    _tier,
                    " Donor #",
                    tierCounter[_tier].toString()
                )
            );
    }

    /**
     * @dev Gets all NFTs owned by an address
     * @param _owner Owner address
     * @return Array of token IDs owned by the address
     */
    function getTokensByOwner(
        address _owner
    ) external view returns (uint256[] memory) {
        return ownerTokens[_owner];
    }

    /**
     * @dev Gets all next tier count for a particular tiear of donor
     * @param _tier tier string -- "Gold" | "Silver" | "Bronze"
     * @return the next tier number
     */
    function getNextTierCount(string memory _tier) external view returns(uint256) {
        return tierCounter[_tier] + 1;
    }

    /**
     * @dev Gets NFT metadata
     * @param _tokenId Token ID
     * @return NFT metadata
     */
    function getNFTMetadata(
        uint256 _tokenId
    ) external view returns (NFTMetadata memory) {
        if (!_exists(_tokenId)) revert TokenDoesNotExist();
        return nftMetadata[_tokenId];
    }

    /**
     * @dev Gets the total number of NFTs minted
     * @return Total number of NFTs
     */
    function getTotalNFTs() external view returns (uint256) {
        return tokenIdCounter;
    }

    /**
     * @dev Gets the number of NFTs minted for a specific tier
     * @param _tier NFT tier
     * @return Number of NFTs in the tier
     */
    function getTierCount(string memory _tier) external view returns (uint256) {
        return tierCounter[_tier];
    }

    /**
     * @dev Checks if a token exists
     * @param tokenId Token ID to check
     * @return Whether the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Checks if the caller is a minter
     */
    function _checkMinter() private view {
        if (
            !hasRole(MINTER_ROLE, msg.sender) &&
            msg.sender != registry.donationManagerAddress()
        ) revert CallerNotMinter();
    }

    /**
     * @dev Overrides supportsInterface to handle multiple inheritance
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControl, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
