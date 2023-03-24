// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import {Ballot, Ballots} from "./Ballot.sol";
import {Candidate, Candidates, MAX_CANDIDATES} from "./Candidate.sol";
import {Distance, Distances} from "./Distance.sol";
import {Path, Paths} from "./Path.sol";
import {Rank} from "./Rank.sol";
import {Sort, Sorts} from "./Sort.sol";

enum State {
    Register,
    Vote,
    Tally
}

contract SchulzeMethodElection is AccessControlEnumerable, Initializable {
    using Ballots for Ballot;
    using Candidates for Candidate;
    using Distances for Distance;
    using Paths for Path;
    using Sorts for Sort;

    bytes32 public constant CANDIDATE_ROLE = keccak256("CANDIDATE_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");

    State public state;
    mapping(address => Ballot) public ballotOf;
    Distance private distances;

    event RegistrationClosed();
    event Voted(address, Ballot);
    event VotingClosed();

    error InvalidState(State actualState, State expectedState);
    error InvalidBallot(Ballot ballot, uint256 numCandidates);
    error TooManyCandidates(uint256 numCandidates, uint256 maxCandidates);

    modifier onlyState(State _expectedState) {
        if (state != _expectedState) {
            revert InvalidState(state, _expectedState);
        }
        _;
    }

    modifier requireValid(Ballot ballot) {
        uint8 _numCandidates = numCandidates();
        if (!ballot.isValid(_numCandidates)) {
            revert InvalidBallot(ballot, _numCandidates);
        }
        _;
    }

    constructor() initializer() {}

    function initialize() external initializer() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // State.Register

    function _grantRole(
        bytes32 role,
        address account
    ) internal override onlyState(State.Register) {
        super._grantRole(role, account);
    }

    function _revokeRole(
        bytes32 role,
        address account
    ) internal override onlyState(State.Register) {
        super._revokeRole(role, account);
    }

    function closeRegistration()
        external
        onlyState(State.Register)
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        state = State.Vote;
        distances.setNumCandidates(numCandidates());
        emit RegistrationClosed();
    }

    // State.Vote

    function vote(
        Ballot ballot
    ) external onlyState(State.Vote) onlyRole(VOTER_ROLE) requireValid(ballot) {
        Ballot storedBallot = ballotOf[msg.sender];
        if (storedBallot.exists()) {
            distances.removeBallot(storedBallot);
        }
        distances.addBallot(ballot);
        ballotOf[msg.sender] = ballot;
        emit Voted(msg.sender, ballot);
    }

    function closeVoting()
        external
        onlyState(State.Vote)
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        state = State.Tally;
        emit VotingClosed();
    }

    // State.Tally
    // Views

    function rankCandidates() external view returns (address[] memory) {
        Path memory paths;
        paths.calculate(distances);

        Sort memory sorts;
        sorts.calculate(paths);

        uint256 _numCandidates = numCandidates();
        address[] memory candidates = new address[](_numCandidates);
        for (uint256 i; i < _numCandidates; i++) {
            candidates[i] = getRoleMember(CANDIDATE_ROLE, sorts.get(i).index());
        }
        return candidates;
    }

    function numCandidates() public view returns (uint8) {
        uint256 _numCandidates = getRoleMemberCount(CANDIDATE_ROLE);
        if (_numCandidates > MAX_CANDIDATES) {
            revert TooManyCandidates(_numCandidates, MAX_CANDIDATES);
        }
        return uint8(_numCandidates);
    }

    function getCandidates() external view returns (address[] memory) {
        uint8 _numCandidates = numCandidates();
        address[] memory candidates = new address[](_numCandidates);
        for (uint8 i = 0; i < _numCandidates; i++) {
            candidates[i] = getRoleMember(CANDIDATE_ROLE, i);
        }
        return candidates;
    }

    function getVoterCandidateRank(
        address voter,
        Candidate candidate
    ) external view returns (Rank) {
        return ballotOf[voter].rankOf(candidate);
    }

    function distance(Candidate a, Candidate b) external view returns (uint256) {
        return distances.getD(a, b);
    }

    function path(Candidate a, Candidate b) external view returns (uint256) {
        Path memory paths;
        paths.calculate(distances);

        return paths.getP(a, b);
    }
}
