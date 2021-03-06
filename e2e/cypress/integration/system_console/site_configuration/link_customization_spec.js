// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @not_cloud @system_console
import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('SupportSettings', () => {
    const tosLink = 'https://github.com/mattermost/platform/blob/master/README.md';
    const privacyLink = 'https://github.com/mattermost/platform/blob/master/README.md';
    const aboutLink = 'http://www.mattermost.org/features/';
    const helpLink = 'https://github.com/mattermost/platform/blob/master/doc/help/README.md';
    const problemLink = 'https://forum.mattermost.org/c/general/trouble-shoot';
    const email = 'bot@mattermost.com';

    const defaultTosLink = 'https://about.mattermost.com/default-terms/';
    const defaultPrivacyLink = 'https://about.mattermost.com/default-privacy-policy/';

    let testTeam;

    beforeEach(() => {
        // # as many of the tests logout the user, ensure it's logged
        // in as an admin before each test
        cy.apiAdminLogin();

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
        });

        // # Visit customization system console page
        cy.visit('/admin_console/site_config/customization');
    });

    it('MM-T1031 - Customization Change all links', () => {
        // # Edit links in the TOS, Privacy, About, Help, Report fields
        cy.findByTestId('SupportSettings.TermsOfServiceLinkinput').clear().type(tosLink);
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkinput').clear().type(privacyLink);
        cy.findByTestId('SupportSettings.AboutLinkinput').clear().type(aboutLink);
        cy.findByTestId('SupportSettings.HelpLinkinput').clear().type(helpLink);
        cy.findByTestId('SupportSettings.ReportAProblemLinkinput').clear().type(problemLink);

        // # Save setting
        saveSetting();

        // # Click Main Menu
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // * Verify that report link is changed
        cy.get('#reportLink').scrollIntoView();
        cy.get('#reportLink').should('be.visible').within(() => {
            cy.get('a').should('contain', 'Report a Problem').
                and('have.attr', 'href').and('equal', problemLink);
        });

        // * Verify that help link is changed
        cy.get('#helpLink').scrollIntoView();
        cy.get('#helpLink').should('be.visible').within(() => {
            cy.get('a').should('contain', 'Help').
                and('have.attr', 'href').and('equal', helpLink);
        });

        // * Verify that /help opens correct link
        // Note: This can not be tested with cypress yet, since it's opening link in a new tab
        // cy.postMessage('/help');
        // cy.url().should('equal', helpLink);

        // # Logout
        cy.apiLogout();
        cy.wait(TIMEOUTS.TWO_SEC);

        // * Verify that the user was redirected to the login page after the logout
        cy.url().should('include', '/login');

        // * Verify that links are correct
        cy.get('#about_link').should('contain', 'About').and('have.attr', 'href').and('equal', aboutLink);
        cy.get('#privacy_link').should('contain', 'Privacy').and('have.attr', 'href').and('equal', privacyLink);
        cy.get('#terms_link').should('contain', 'Terms').and('have.attr', 'href').and('equal', tosLink);
        cy.get('#help_link').should('contain', 'Help').and('have.attr', 'href').and('equal', helpLink);

        // # Visit signup page
        cy.get('#signup').click();

        // * Verify that links are correct
        cy.get('#about_link').should('contain', 'About').and('have.attr', 'href').and('equal', aboutLink);
        cy.get('#privacy_link').should('contain', 'Privacy').and('have.attr', 'href').and('equal', privacyLink);
        cy.get('#terms_link').should('contain', 'Terms').and('have.attr', 'href').and('equal', tosLink);
        cy.get('#help_link').should('contain', 'Help').and('have.attr', 'href').and('equal', helpLink);
    });

    it('MM-T1032 - Customization: Custom Terms and Privacy links in the About modal', () => {
        // # Edit links in the TOS and Privacy fields
        cy.findByTestId('SupportSettings.TermsOfServiceLinkinput').clear().type(tosLink);
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkinput').clear().type(privacyLink);

        // # Save setting
        saveSetting();

        // # Open about modal
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#about').click();

        // * Verify that links do not change and they open to default pages
        cy.get('#tosLink').should('contain', 'Terms of Service').and('have.attr', 'href').and('equal', defaultTosLink);
        cy.get('#privacyLink').should('contain', 'Privacy Policy').and('have.attr', 'href').and('equal', defaultPrivacyLink);
    });

    it('MM-T1033 - Customization: Blank TOS link field (login page)', () => {
        // # Empty the "terms of services" field
        cy.findByTestId('SupportSettings.TermsOfServiceLinkinput').clear();

        // # Save setting
        saveSetting();

        // # Logout
        cy.apiLogout();

        // * Verify that the user was redirected to the login page after the logout
        cy.url().should('include', '/login');

        // * Verify that terms of services link is set to default
        cy.get('#terms_link').should('contain', 'Terms').and('have.attr', 'href').and('equal', defaultTosLink);
    });

    it('MM-T1034 - Customization: Blank TOS link field (About modal)', () => {
        // # Empty the "terms of services" field
        cy.findByTestId('SupportSettings.TermsOfServiceLinkinput').clear();

        // # Save setting
        saveSetting();

        // # Open about modal
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#about').click();

        // * Verify that tos link is set to default
        cy.get('#tosLink').should('contain', 'Terms of Service').and('have.attr', 'href').and('equal', defaultTosLink);
    });

    it('MM-T1035 - Customization Blank Privacy hides the link', () => {
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkinput').clear();

        // # Save setting
        saveSetting();

        // # Open about modal
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#about').click();

        // * Verify that tos link is there
        cy.get('#tosLink').should('be.visible').and('contain', 'Terms of Service');

        // * Verify that privacy link is there
        cy.get('#privacyLink').should('contain', 'Privacy Policy').and('have.attr', 'href').and('equal', defaultPrivacyLink);

        // # Logout
        cy.apiLogout();

        // * Verify that the user was redirected to the login page after the logout
        cy.url().should('include', '/login');

        // * Verify no privacy link
        cy.get('#privacy_link').should('not.exist');

        // # Visit signup page
        cy.get('#signup').click();

        // * Verify no privacy link
        cy.get('#privacy_link').should('not.exist');
    });

    it('MM-T1036 - Customization: Blank Help and Report a Problem hides options from main menu', () => {
        // # Change help and report links to blanks
        cy.findByTestId('SupportSettings.HelpLinkinput').clear();
        cy.findByTestId('SupportSettings.ReportAProblemLinkinput').clear();

        // # Save setting
        saveSetting();

        // # Click Main Menu
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // * Verify that report link does not exist
        cy.get('#reportLink').should('not.exist');

        // * Verify that help link does not exist
        cy.get('#helpLink').should('not.exist');
    });

    it('MM-T1037 - Customization Custom Support Email', () => {
        // # Edit links in the support email field
        cy.findByTestId('SupportSettings.SupportEmailinput').clear().type(email);

        // # Save setting
        saveSetting();

        // # Create new user to run tutorial
        cy.apiCreateUser({bypassTutorial: false}).then(({user: user1}) => {
            cy.apiAddUserToTeam(testTeam.id, user1.id);

            cy.apiLogin(user1);
            cy.visit(`/${testTeam.name}/channels/town-square`);

            // # Hit "Next" twice
            cy.get('#tutorialNextButton').click();
            cy.get('#tutorialNextButton').click();

            // * Verify that proper email is displayed
            cy.get('#supportInfo').within(() => {
                cy.get('a').should('have.attr', 'href').and('equal', 'mailto:' + email);
            });
        });
    });

    it('MM-T1038 - Customization App download link - Change to different', () => {
        // # Edit links in the support email field
        const link = 'some_link';
        cy.findByTestId('NativeAppSettings.AppDownloadLinkinput').clear().type(link);

        // # Save setting
        saveSetting();

        // # Click Main Menu
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // * Verify that app link is changed
        cy.get('#nativeAppLink').scrollIntoView();
        cy.get('#nativeAppLink').should('be.visible').within(() => {
            cy.get('a').should('contain', 'Download Apps').
                and('have.attr', 'href').and('equal', link);
        });
    });

    it('MM-T1039 - Customization App download link - Remove', () => {
        // # Edit links in the support email field
        cy.findByTestId('NativeAppSettings.AppDownloadLinkinput').clear();

        // # Save setting
        saveSetting();

        // # Click Main Menu
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.wait(TIMEOUTS.TWO_SEC);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // * Verify that app link does not exist
        cy.get('#nativeAppLink').should('not.exist');

        // # Create new user to run tutorial
        cy.apiCreateUser({bypassTutorial: false}).then(({user: user1}) => {
            cy.apiAddUserToTeam(testTeam.id, user1.id);

            cy.apiLogin(user1);
            cy.visit(`/${testTeam.name}/channels/town-square`);

            // # Hit "Next"
            cy.get('#tutorialNextButton').click();

            // * Verify that app download link does not exist
            cy.get('#appDownloadLink').should('not.exist');
        });
    });

    it('MM-T3289 - Help (Ask community link setting)', () => {
        // * Verify enable ask community link to be true by default
        cy.findByTestId('SupportSettings.EnableAskCommunityLinktrue').should('be.checked');

        // * Verify the help text
        cy.findByTestId('SupportSettings.EnableAskCommunityLinkhelp-text').should('contain', 'When true, "Ask the community" link appears on the Mattermost user interface and Main Menu, which allows users to join the Mattermost Community to ask questions and help others troubleshoot issues. When false, the link is hidden from users.');

        // # Click Main Menu
        cy.visit(`/${testTeam.name}/channels/town-square`);

        cy.get('#channel-header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').within(() => {
            // * Verify that hover shows "Help" text
            cy.get('#channelHeaderUserGuideButton').trigger('mouseover', {force: true});
            cy.get('#channelHeaderUserGuideButton').should('have.attr', 'aria-describedby').and('equal', 'userGuideHelpTooltip');
            cy.get('#channelHeaderUserGuideButton').trigger('mouseout', {force: true});
            cy.get('#channelHeaderUserGuideButton').should('not.have.attr', 'aria-describedby');

            // # Click on the help icon
            cy.get('#channelHeaderUserGuideButton').click();

            // * Verify 4 options shown
            cy.get('#askTheCommunityLink').should('be.visible');
            cy.get('#helpResourcesLink').should('be.visible');
            cy.get('#reportAProblemLink').should('be.visible');
            cy.get('#keyboardShortcuts').should('be.visible');

            // * Verify ask the default ask the community link
            cy.get('#askTheCommunityLink').within(() => {
                cy.get('a').should('have.attr', 'href').and('equal', 'https://mattermost.com/pl/default-ask-mattermost-community/');
            });
        });
    });

    it('MM-T3289 - Help (Ask community link setting) 2', () => {
        // Disable setting for ask community
        cy.findByTestId('SupportSettings.EnableAskCommunityLinkfalse').click();

        // Edit help link and report a problem link
        cy.findByTestId('SupportSettings.HelpLinkinput').clear().type(helpLink);
        cy.findByTestId('SupportSettings.ReportAProblemLinkinput').clear().type(problemLink);

        // # Save setting
        saveSetting();

        // # Go to town-square
        cy.visit(`/${testTeam.name}/channels/town-square`);

        cy.get('#channel-header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').within(() => {
            // # Click on the help icon
            cy.get('#channelHeaderUserGuideButton').click();

            // * Verify only 3 options shown
            cy.get('#askTheCommunityLink').should('not.exist');
            cy.get('#helpResourcesLink').should('be.visible');
            cy.get('#reportAProblemLink').should('be.visible');
            cy.get('#keyboardShortcuts').should('be.visible');

            // * Verify help link has changed
            cy.get('#helpResourcesLink').within(() => {
                cy.get('a').should('have.attr', 'href').and('equal', helpLink);
            });

            // * Verify report a problem link has changed
            cy.get('#reportAProblemLink').within(() => {
                cy.get('a').should('have.attr', 'href').and('equal', problemLink);
            });

            // # Click on keyboard shortcuts
            cy.get('#keyboardShortcuts').click();
        });

        // * Verify link opens keyboard shortcuts modal
        cy.get('#shortcutsModalLabel').should('be.visible');
    });
});

function saveSetting() {
    // # Click save button, and verify text and visibility
    cy.get('#saveSetting').
        should('have.text', 'Save').
        and('be.enabled').
        click().
        should('be.disabled').
        wait(TIMEOUTS.HALF_SEC);
}
