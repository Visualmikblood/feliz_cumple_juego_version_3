# TODO - Fix Multiplayer Mode UI in BirthdayGame (src/App.jsx)

## Problem
- When clicking "Jugar Multijugador," the UI shown is the rating game UI instead of the multiplayer setup UI with name input and room creation/joining.
- This indicates that the gameState or rendering logic is not correctly showing the multiplayer setup screen.

## Analysis
- startGame function should set gameState to 'setup' when multiplayer is true.
- Rendering logic should show multiplayer setup UI when isMultiplayer is true and gameState is 'setup'.
- Current code seems correct but behavior indicates otherwise.

## Plan
1. Verify and enforce in startGame that when multiplayer is true:
   - gameState is set to 'setup'
   - gameStarted is set to false
2. Verify rendering logic in src/App.jsx:
   - Show multiplayer setup UI if isMultiplayer && gameState === 'setup'
   - Show rating game UI only if isMultiplayer && gameState === 'playing'
3. Add console logs or debug statements to confirm state changes on clicking "Jugar Multijugador".
4. Test the fix to ensure the multiplayer setup UI appears correctly.
5. If needed, refactor multiplayer UI into separate component for clarity.

## Next Steps
- Ask user to confirm this plan before proceeding with code changes.
