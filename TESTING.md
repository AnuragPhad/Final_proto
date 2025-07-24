# Kisan AI - Functional & GUI Test Cases

This document outlines the test cases for the main features of the Kisan AI application. These tests are intended to be performed manually to verify the functionality and user interface.

## 1. General App Functionality & UI

| Test ID | Feature                 | Action                                                                                                 | Expected Result                                                                                                                              |
|---------|-------------------------|--------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| **1.1** | App Launch & Dashboard  | Open the application's root URL.                                                                       | The dashboard loads without errors. All feature cards are visible with correct titles and icons. The header is displayed correctly.            |
| **1.2** | Responsive Design       | Resize the browser from desktop to mobile width.                                                       | The layout adapts smoothly. On mobile, a hamburger menu appears. Cards rearrange into a single column. No content overflows.                  |
| **1.3** | Language Switching      | Click the globe icon in the header. Select 'Hindi', then 'Marathi', then back to 'English'.            | All UI text (titles, descriptions, buttons) correctly translates. The language selection persists across different pages.                    |
| **1.4** | Navigation (Desktop)    | Click on each feature card on the dashboard.                                                           | The user is correctly navigated to the respective page (`/mandi-rates`, `/crop-doctor`, etc.).                                               |
| **1.5** | Navigation (Mobile)     | On a mobile view, tap the hamburger menu to open the sidebar. Tap on each feature link.                | The sidebar opens. The user is correctly navigated to the respective page, and the sidebar closes.                                           |

## 2. User Authentication

| Test ID | Feature          | Action                                                                         | Expected Result                                                                                                                                 |
|---------|------------------|--------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| **2.1** | Login            | Navigate to `/login`. Enter a username and password and click 'Login'.         | The user is redirected to the dashboard. The header now shows the user's name and an avatar.                                                    |
| **2.2** | Logout           | While logged in, click the user avatar in the header and select 'Log out'.     | The user is logged out. The header reverts to showing the generic 'Login' icon. The user is redirected to the login page or dashboard.         |
| **2.3** | Access Control   | While logged out, attempt to post in the Community.                            | The action is blocked. A toast notification appears prompting the user to log in.                                                               |

## 3. Mandi Rates

| Test ID | Feature                      | Action                                                                                                          | Expected Result                                                                                                                             |
|---------|------------------------------|-----------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| **3.1** | Default Data Load            | Navigate to the Mandi Rates page.                                                                               | The page loads with default data (e.g., Pune, today's date). A list of commodity rates is displayed.                                        |
| **3.2** | Location & Date Filtering    | Change the state, district, and date using the dropdowns and calendar.                                          | The rate list updates to show data corresponding to the new selection. The title "Rates for [District] on [Date]" updates correctly.      |
| **3.3** | Use My Location              | Click the 'Use My Location' button and grant permission.                                                        | The app detects the user's location (State/District) and updates the filters and rate list accordingly. A success toast appears.          |
| **3.4** | Voice Search                 | Click the microphone icon, say "Show me onion rates in Nashik for today".                                       | The app processes the command. The AI summary updates, and the filters and results are set to Onion in Nashik for the current date.         |
| **3.5** | Commodity Filter & Trend     | Click on a specific commodity card from the list (e.g., 'Potato').                                              | The view scrolls up. A price trend chart and AI selling advice for 'Potato' appear. The results below are filtered to only show 'Potato'. |
| **3.6** | Text-to-Speech (TTS)         | After a voice search, click the speaker icon next to the AI Summary.                                            | The AI-generated text summary is read aloud. The icon may show a loading state while the audio is being generated.                      |
| **3.7** | Clear Filters                | Click the 'Clear Filter' or 'Clear Filters & Refresh' button.                                                   | All filters are reset to their default state, and the full list of rates for the selected location/date is displayed.                       |

## 4. Crop Doctor

| Test ID | Feature               | Action                                                                   | Expected Result                                                                                                                            |
|---------|-----------------------|--------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| **4.1** | Image Upload          | On the Crop Doctor page, click 'Choose File' and select a valid image.   | The image preview is displayed correctly in the preview box. The 'Analyze Crop Health' button becomes enabled.                             |
| **4.2** | AI Analysis           | With an image uploaded, click 'Analyze Crop Health'.                     | A loading skeleton appears. After processing, the AI Analysis Report card is displayed with Health Status, Summary, and proposed solutions. |
| **4.3** | Solution Links        | Click on one of the 'Inorganic Solutions' cards.                         | A new browser tab opens to a Google search for the suggested product.                                                                      |
| **4.4** | Find Shops Link       | Click on the 'Find Nearby Shops' card.                                   | A new browser tab opens to a Google Maps search for "fertilizer pesticide shops near me".                                                  |

## 5. My Farm

| Test ID | Feature              | Action                                                                                             | Expected Result                                                                                                                                |
|---------|----------------------|----------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| **5.1** | Add Crop Cycle       | Click 'Start New Crop Cycle'. Fill in the crop name and sowing date. Click 'Add Cycle'.              | A new crop cycle card appears on the 'My Farm' dashboard with the correct details, progress bar, and animated plant graphic.               |
| **5.2** | Edit Crop Cycle      | On an existing cycle card, click the pencil icon. Change the crop or date and save.                  | The details on the card update to reflect the changes.                                                                                         |
| **5.3** | Delete Crop Cycle    | On an existing cycle card, click the trash icon. Confirm the deletion in the alert dialog.           | The card is removed from the dashboard.                                                                                                        |

## 6. Community

| Test ID | Feature               | Action                                                                                          | Expected Result                                                                                                                                |
|---------|-----------------------|-------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| **6.1** | Create Text Post      | While logged in, type a message in the "Create a new post" box and click 'Post'.                  | The new post appears at the top of the feed with the user's name and avatar. The text area is cleared.                                         |
| **6.2** | Create Image Post     | Attach an image and add some text. Click 'Post'.                                                | The new post appears with both the text and the uploaded image displayed correctly.                                                            |
| **6.3** | Like/Unlike a Post    | Click the 'Like' button on a post. Click it again.                                              | The like count increments, and the button shows a 'liked' state. Clicking again decrements the count and reverts the button's state.           |
| **6.4** | Comment on a Post     | Click the 'Comment' button. Type a comment in the input field that appears and post it.           | The comment appears below the post with the user's name and avatar. The comment count on the button updates.                                   |
| **6.5** | Delete Own Post       | On a post created by the logged-in user, click the trash icon and confirm deletion.               | The post is removed from the feed.                                                                                                             |
| **6.6** | View Others' Posts    | View posts from other users.                                                                    | The delete icon should NOT be visible on posts not created by the current user.                                                                |
