/**
 * HTTP 410 Gone — legacy student document pipeline retired (MVP uses `user_applications` only).
 * See README "Deprecated endpoints".
 */
export function documentPipelineGone(req, res) {
  res.status(410).json({
    success: false,
    error:
      'The document upload and checklist API has been retired. Use My Applications (GET/POST/PATCH /api/user-applications) for MVP.',
    code: 'DOCUMENT_PIPELINE_RETIRED'
  });
}
