from rest_framework import serializers
from .models import Team, TeamMember
from users_app.models import User


class TeamMemberSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    user_email = serializers.ReadOnlyField(source='user.email')
    user_role = serializers.ReadOnlyField(source='user.role')

    class Meta:
        model = TeamMember
        fields = [
            'team_member_id', 'team', 'user', 'user_username', 'user_email', 'user_role',
            'role_in_team', 'joined_at'
        ]
        read_only_fields = ['team_member_id', 'joined_at']


class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(many=True, read_only=True, source='membership_details')
    project_title = serializers.ReadOnlyField(source='project.title')
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            'team_id', 'name', 'project', 'project_title',
            'members', 'member_count', 'created_at'
        ]
        read_only_fields = ['team_id', 'created_at']

    def get_member_count(self, obj):
        return obj.members.count()


class AddTeamMemberSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(help_text="ID пользователя")
    role_in_team = serializers.ChoiceField(
        choices=TeamMember.Role.choices,
        help_text="Роль в команде: DEVELOPER, TESTER, LEAD"
    )

    def validate_user_id(self, value):
        try:
            User.objects.get(pk=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Пользователь не найден")
        return value
