# Backend Update Required: Member-Specific Workout Plans Endpoint

## Problem
The current `/workout-plans/get-all` endpoint returns **template** data only. When members customize exercises or move plans to different days, the frontend doesn't see these changes because:

1. `MemberSubTitleOverride` (custom exercise names, links, order) is not applied
2. `MemberPlanDayOverride` (custom plan days) is not applied

## Solution
Create a new endpoint that returns the **member-customized view** of all workout plans.

---

## New Endpoint Specification

### Endpoint
```http
GET /api/v1/workout-plans/member/get-all
Authorization: Bearer {token}
```

### Purpose
Returns all workout plans with member-specific overrides applied:
- Custom exercise names, tutorial links, sort orders (from `MemberSubTitleOverride`)
- Custom plan days (from `MemberPlanDayOverride`)
- Falls back to template values if no override exists

### Response Structure
```json
[
  {
    "id": 101,
    "title": "Chest Workout",
    "dayOfWeek": "TUESDAY",  // ← This is the EFFECTIVE day (override OR template)
    "isCustomDay": true,      // ← NEW: true if member moved this plan
    "subTitles": [
      {
        "id": 201,
        "subTitle": "Modified Push-ups",  // ← EFFECTIVE name (override OR template)
        "imageName": "pushups.jpg",        // ← Always from template (never overridden)
        "tutorialLink": "https://youtube.com/custom",  // ← EFFECTIVE link
        "sortOrder": 1,                     // ← EFFECTIVE order
        "isCustomContent": true             // ← NEW: true if member customized this exercise
      },
      {
        "id": 202,
        "subTitle": "Bench Press",
        "imageName": "bench.jpg",
        "tutorialLink": "https://youtube.com/default",
        "sortOrder": 2,
        "isCustomContent": false  // ← No override, showing template
      }
    ]
  }
]
```

---

## Implementation Guide

### 1. Create New DTO (if needed)

```java
// Add to WorkOutPlanRes or create new MemberWorkOutPlanRes
@Data
@Builder
public class MemberWorkOutPlanRes {
    private Long id;
    private String title;
    private DayOfWeek dayOfWeek;      // EFFECTIVE day
    private Boolean isCustomDay;       // true if overridden
    private List<MemberSubTitleRes> subTitles;
}

@Data
@Builder
public class MemberSubTitleRes {
    private Long id;
    private String subTitle;           // EFFECTIVE name
    private String imageName;          // Always from template
    private String tutorialLink;       // EFFECTIVE link
    private Integer sortOrder;         // EFFECTIVE order
    private Boolean isCustomContent;   // true if overridden
}
```

### 2. Controller Method

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/workout-plans/")
public class WorkOutPlanController extends BaseController {

    private final MobileWorkOutPlanService workOutPlanService;

    /**
     * Returns all workout plans with member-specific customizations applied.
     * Replaces the client's usage of /get-all in workout-manager.
     */
    @GetMapping("member/get-all")
    public ResponseEntity<?> getMemberWorkoutPlans() {
        List<MemberWorkOutPlanRes> plans = workOutPlanService.findAllForMember();
        log.info("Fetched member-specific workout plans, count: {}", plans.size());
        return listResponse(plans);
    }
}
```

### 3. Service Method Logic

```java
@Service
@RequiredArgsConstructor
public class MobileWorkOutPlanService {

    // ... existing repositories ...
    private final MemberSubTitleOverrideRepository subTitleOverrideRepository;
    private final MemberPlanDayOverrideRepository planDayOverrideRepository;

    /**
     * Returns all workout plans with member-specific overrides applied.
     */
    @Transactional(readOnly = true)
    public List<MemberWorkOutPlanRes> findAllForMember() {
        Long memberId = jwtHelper.getMemberIdFromRequest();
        Member member = requireMember(memberId);

        // 1. Load all template plans for this gym
        List<WorkOutPlan> templates = workOutPlanRepository.findAll(member.getAppUserId());

        // 2. Load all plan day overrides for this member (in one query)
        Map<Long, MemberPlanDayOverride> planDayOverrides = planDayOverrideRepository
                .findActiveByMemberId(memberId)
                .stream()
                .collect(Collectors.toMap(
                    MemberPlanDayOverride::getWorkOutPlanId,
                    o -> o,
                    (a, b) -> a
                ));

        // 3. Load all subtitle overrides for this member (in one query)
        Map<Long, MemberSubTitleOverride> subtitleOverrides = subTitleOverrideRepository
                .findActiveByMemberId(memberId)
                .stream()
                .collect(Collectors.toMap(
                    MemberSubTitleOverride::getWorkOutPlanSubTitleId,
                    o -> o,
                    (a, b) -> a
                ));

        // 4. Transform each plan
        return templates.stream()
                .map(plan -> buildMemberPlan(plan, planDayOverrides, subtitleOverrides))
                .collect(Collectors.toList());
    }

    private MemberWorkOutPlanRes buildMemberPlan(
            WorkOutPlan plan,
            Map<Long, MemberPlanDayOverride> planDayOverrides,
            Map<Long, MemberSubTitleOverride> subtitleOverrides) {

        // Apply plan day override if it exists
        MemberPlanDayOverride dayOverride = planDayOverrides.get(plan.getId());
        DayOfWeek effectiveDay = dayOverride != null 
            ? dayOverride.getCustomDayOfWeek() 
            : plan.getDayOfWeek();

        // Load and transform subtitles
        List<WorkOutPlanSubTitle> templateSubtitles = subTitleRepository
                .findByWorkOutPlanIdOrderBySortOrderAsc(plan.getId());

        List<MemberSubTitleRes> effectiveSubtitles = templateSubtitles.stream()
                .map(sub -> buildMemberSubtitle(sub, subtitleOverrides))
                .sorted(Comparator.comparingInt(MemberSubTitleRes::getSortOrder))
                .collect(Collectors.toList());

        return MemberWorkOutPlanRes.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .dayOfWeek(effectiveDay)
                .isCustomDay(dayOverride != null)
                .subTitles(effectiveSubtitles)
                .build();
    }

    private MemberSubTitleRes buildMemberSubtitle(
            WorkOutPlanSubTitle template,
            Map<Long, MemberSubTitleOverride> subtitleOverrides) {

        MemberSubTitleOverride override = subtitleOverrides.get(template.getId());

        return MemberSubTitleRes.builder()
                .id(template.getId())
                .subTitle(override != null && override.getCustomSubTitle() != null
                    ? override.getCustomSubTitle()
                    : template.getSubTitle())
                .imageName(template.getImageName())  // Always from template
                .tutorialLink(override != null && override.getCustomTutorialLink() != null
                    ? override.getCustomTutorialLink()
                    : template.getTutorialLink())
                .sortOrder(override != null && override.getCustomSortOrder() != null
                    ? override.getCustomSortOrder()
                    : template.getSortOrder())
                .isCustomContent(override != null)
                .build();
    }
}
```

### 4. Required Repository Methods

If these methods don't exist, add them:

```java
// MemberPlanDayOverrideRepository.java
public interface MemberPlanDayOverrideRepository extends JpaRepository<MemberPlanDayOverride, Long> {
    
    @Query("SELECT o FROM MemberPlanDayOverride o WHERE o.memberId = :memberId AND o.active = true")
    List<MemberPlanDayOverride> findActiveByMemberId(@Param("memberId") Long memberId);
    
    @Query("SELECT o FROM MemberPlanDayOverride o WHERE o.memberId = :memberId AND o.workOutPlanId = :planId AND o.active = true")
    Optional<MemberPlanDayOverride> findActiveByMemberIdAndPlanId(
        @Param("memberId") Long memberId, 
        @Param("planId") Long planId
    );
}

// MemberSubTitleOverrideRepository.java
public interface MemberSubTitleOverrideRepository extends JpaRepository<MemberSubTitleOverride, Long> {
    
    @Query("SELECT o FROM MemberSubTitleOverride o WHERE o.memberId = :memberId AND o.active = true")
    List<MemberSubTitleOverride> findActiveByMemberId(@Param("memberId") Long memberId);
    
    @Query("SELECT o FROM MemberSubTitleOverride o WHERE o.memberId = :memberId AND o.workOutPlanSubTitleId = :subTitleId AND o.active = true")
    Optional<MemberSubTitleOverride> findActiveByMemberIdAndSubTitleId(
        @Param("memberId") Long memberId, 
        @Param("subTitleId") Long subTitleId
    );
}
```

---

## Testing Checklist

### Test Scenario 1: No Overrides (Default Behavior)
```bash
# Member has no customizations
GET /api/v1/workout-plans/member/get-all

# Expected:
# - All plans show template dayOfWeek
# - All exercises show template content
# - isCustomDay = false for all plans
# - isCustomContent = false for all exercises
```

### Test Scenario 2: Plan Day Override
```bash
# 1. Move "Chest Workout" from MONDAY to WEDNESDAY
PUT /api/v1/workout-plans/update/101
{ "dayOfWeek": "WEDNESDAY" }

# 2. Fetch member view
GET /api/v1/workout-plans/member/get-all

# Expected:
# - Plan 101 shows dayOfWeek: "WEDNESDAY"
# - Plan 101 shows isCustomDay: true
# - Other plans unchanged
```

### Test Scenario 3: Exercise Content Override
```bash
# 1. Customize exercise name
PUT /api/v1/workout-plans/subtitle/201
{ 
  "subTitle": "Modified Push-ups",
  "tutorialLink": "https://youtube.com/custom",
  "sortOrder": 1
}

# 2. Fetch member view
GET /api/v1/workout-plans/member/get-all

# Expected:
# - Exercise 201 shows subTitle: "Modified Push-ups"
# - Exercise 201 shows tutorialLink: "https://youtube.com/custom"
# - Exercise 201 shows isCustomContent: true
# - imageName still from template
```

### Test Scenario 4: Multiple Overrides
```bash
# Member has customized:
# - Plan day (MONDAY → WEDNESDAY)
# - Exercise 201 (name, link, order)
# - Exercise 202 (order only)

GET /api/v1/workout-plans/member/get-all

# Expected:
# - Plan shows custom day
# - Exercise 201 shows all custom fields
# - Exercise 202 shows custom order, template name/link
# - Exercises sorted by effective sortOrder
```

---

## Frontend Integration

Once backend is updated, frontend will call:

```typescript
// Before (template only):
GET /workout-plans/get-all

// After (member-specific):
GET /workout-plans/member/get-all
```

No other frontend changes needed - the response structure is compatible.

---

## Performance Optimization

✅ **Efficient**: Loads all overrides in 2 queries total (not N+1)
✅ **Scalable**: Works for members with 0 or 1000 customizations
✅ **Consistent**: Always shows member's current view

---

## Migration Strategy

### Phase 1: Add New Endpoint (Non-Breaking)
- Add `/member/get-all` endpoint
- Keep `/get-all` for backwards compatibility

### Phase 2: Update Frontend
- Change workout-manager to use `/member/get-all`
- Test thoroughly

### Phase 3: Optional Cleanup
- Deprecate `/get-all` if no longer needed
- Or keep it for admin/template viewing

---

## Summary

**What to implement:**
1. ✅ New endpoint: `GET /api/v1/workout-plans/member/get-all`
2. ✅ Service method: `findAllForMember()`
3. ✅ DTO fields: `isCustomDay`, `isCustomContent`
4. ✅ Repository methods: `findActiveByMemberId()`
5. ✅ Override application logic

**Why it's needed:**
- Current `/get-all` shows templates only
- Members' customizations are stored but not displayed
- Frontend needs to see the "effective" view (template + overrides)

**Testing priority:**
- No overrides → same as template
- Plan day override → custom day shown
- Exercise override → custom content shown
- Multiple overrides → all applied correctly
