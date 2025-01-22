export const checkAlert = (predefinedDate) => {
    const today = new Date();
    const targetDate = new Date(predefinedDate);
    const timeDiff = targetDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff === 30) {
        const lastAlertDate = localStorage.getItem('lastAlertDate');
        const todayStr = today.toDateString();

        if (lastAlertDate !== todayStr) {
            alert('Falta un mes para la fecha predefinida.');
            localStorage.setItem('lastAlertDate', todayStr);
        }
    }
};
