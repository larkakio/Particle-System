// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract CheckInTest is Test {
    CheckIn public c;

    address alice = address(0xA11CE);

    function setUp() public {
        c = new CheckIn();
    }

    function test_RevertWhenSendingETH() public {
        vm.expectRevert(CheckIn.InvalidValue.selector);
        c.checkIn{value: 1 wei}();
    }

    function test_FirstCheckIn() public {
        vm.prank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 1);
        uint256 day = block.timestamp / 1 days;
        assertEq(c.lastCheckInDay(alice), day + 1);
        assertEq(c.lastCalendarDay(alice), day);
    }

    function test_RevertDoubleSameDay() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(CheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_StreakConsecutiveDays() public {
        vm.warp(1_700_000_000);
        vm.startPrank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 1);

        vm.warp(block.timestamp + 1 days);
        c.checkIn();
        assertEq(c.streak(alice), 2);

        vm.warp(block.timestamp + 1 days);
        c.checkIn();
        assertEq(c.streak(alice), 3);
        vm.stopPrank();
    }

    function test_StreakResetsAfterGap() public {
        vm.warp(1_800_000_000);
        vm.startPrank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 1);

        vm.warp(block.timestamp + 2 days);
        c.checkIn();
        assertEq(c.streak(alice), 1);
        vm.stopPrank();
    }
}
