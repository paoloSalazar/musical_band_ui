export const EventMusicianService = {
  getEventMusicians: (eventId: number) => eventsApi.getEventMusicians(eventId),
  assignMusician: (eventId: number, data: any) => eventsApi.assignMusician(eventId, data),
  updateMusicianAssignment: (eventId: number, musicianId: number, data: any) => eventsApi.updateMusicianAssignment(eventId, musicianId, data),
  removeMusician: (eventId: number, musicianId: number) => eventsApi.removeMusician(eventId, musicianId),
};
