// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily check-in on Base. No ETH accepted — user pays L2 gas only.
/// @dev `lastCheckInDay` stores calendar day index + 1 (0 means never checked in).
contract CheckIn {
    error InvalidValue();
    error AlreadyCheckedInToday();

    mapping(address => uint256) public lastCheckInDay;
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 dayIndex, uint256 newStreak);

    function checkIn() external payable {
        if (msg.value != 0) revert InvalidValue();

        uint256 today = block.timestamp / 1 days;
        uint256 lastRaw = lastCheckInDay[msg.sender];

        if (lastRaw != 0 && lastRaw - 1 == today) revert AlreadyCheckedInToday();

        uint256 newStreak;
        if (lastRaw == 0) {
            newStreak = 1;
        } else if (lastRaw - 1 == today - 1) {
            newStreak = streak[msg.sender] + 1;
        } else {
            newStreak = 1;
        }

        lastCheckInDay[msg.sender] = today + 1;
        streak[msg.sender] = newStreak;

        emit CheckedIn(msg.sender, today, newStreak);
    }

    /// @notice Calendar day index of last check-in (`block.timestamp / 1 days`), or 0 if never.
    function lastCalendarDay(address user) external view returns (uint256) {
        uint256 raw = lastCheckInDay[user];
        return raw == 0 ? 0 : raw - 1;
    }
}
