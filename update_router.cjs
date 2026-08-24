const fs = require('fs');

const file = 'src/router/AppRouter.tsx';
let content = fs.readFileSync(file, 'utf8');

// Insert import if not exists
if (!content.includes('import TrainerBookingPage')) {
  content = content.replace(
    /import AiFitnessPage from "\.\.\/pages\/member\/AiFitnessPage";/,
    'import AiFitnessPage from "../pages/member/AiFitnessPage";\nimport TrainerBookingPage from "../pages/member/TrainerBookingPage";'
  );
}

// Insert route if not exists
if (!content.includes('ROUTES.MEMBER_BOOKING')) {
  const routeString = 
                        {/* =================================
                         * MEMBER - TRAINER BOOKING
                         * ================================= */}
                        <Route
                            path={ROUTES.MEMBER_BOOKING}
                            element={
                                <RoleGuard roles={["ROLE_MEMBER"]}>
                                    <TrainerBookingPage />
                                </RoleGuard>
                            }
                        />
;
  content = content.replace(
    /(<Route\s*path=\{\s*ROUTES\.MEMBER_WORKOUTS\s*\}\s*element=\{)/,
    routeString + '\n                        '
  );
}

fs.writeFileSync(file, content, 'utf8');
console.log('Updated AppRouter.tsx');
