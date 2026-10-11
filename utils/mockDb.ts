// Mövcud olan istifadəçi adları və e-poçtlar bazası
const TAKEN_USERNAMES = ['samaya', 'admin', 'john_doe', 'developer', 'alex'];
const REGISTERED_EMAILS = ['smayq28@gmail.com', 'admin@example.com', 'test@example.com'];

// Username-in bazada olub-olmadığını yoxlayan asinxron funksiya
export function checkUsernameAvailable(username: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isTaken = TAKEN_USERNAMES.includes(username.toLowerCase().trim());
      resolve(!isTaken);
    }, 500); // 500ms server gecikməsi
  });
}

// Email-in sistemdə qeydiyyatda olub-olmadığını yoxlayan asinxron funksiya
export function checkEmailAvailable(email: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isTaken = REGISTERED_EMAILS.includes(email.toLowerCase().trim());
      resolve(!isTaken);
    }, 500);
  });
}